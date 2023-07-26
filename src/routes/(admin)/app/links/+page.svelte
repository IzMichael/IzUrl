<svelte:head>
    <title>IzURL</title>
</svelte:head>

<script>
    export let data;
    import { pb, auth } from '$lib/database.js';
    import Parser from 'ua-parser-js';
    import { toast } from '@zerodevx/svelte-toast';

    import Header from '$lib/Header.svelte';
    import OptionalFeature from '$lib/OptionalFeature.svelte';
    import UTMTagEditor from '$lib/UTMTagEditor.svelte';
    import QRCodeGenerator from '$lib/QRCodeGenerator.svelte';
    import { getMetaTags } from '$lib/metatags.js';
    import { copy } from '$lib/clipboard.js';

    let tab = 'editor', elink = {}, metatags = {}, eclicks = [];

    function genSlug(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        };
        return result;
    };

    $: dataGet(elink);

    async function dataGet() {
        if (elink?.id) {
            if (elink.features.customog == true) {
                metatags = { title: elink.ogtitle || '...', description: elink.ogdesc || '...', image: elink.ogimage || 'https://via.placeholder.com/150.png' };
            } else {
                metatags = await getMetaTags(elink.long);
            };

            if (eclicks.length < 1 || eclicks[0].link != elink.id) {
                eclicks = await pb.collection('clicks').getFullList(200, {
                    filter: `link.id = "${elink.id}"`
                });
                eclicks.map(a => a.ua = new Parser(a.useragent));
            };
        };
    };

    import jsSHA from 'jssha';
    let password = '';
    async function encryptPassword() {
        const salt = genSlug(password.length);
        const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
        shaObj.update(password + salt);
        const hash = shaObj.getHash('HEX');

        elink.password = hash;
        elink.passwordsalt = salt;
        password = new Array(salt.length + 1).join('*');
        return true;
    };

    let unsaved = false, saveMsg = 'Save Changes';
    $: unsaved = !(JSON.stringify(data.links.filter(a => a.id == elink.id)[0] ?? {}) == JSON.stringify(elink ?? {}));

    let input = '';

    function dtLocal(date) {
        let local = new Date(date);
        local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return local.toJSON().slice(0, 16).replace('T', ' ');
    };
</script>

<div class="flex flex-row justify-center items-center w-screen h-screen overflow-hidden">
    <div class="flex flex-col justify-start items-center flex-1 h-full">
        <Header />

        <div class="px-5 pt-5 w-full flex flex-row justify-between items-center">
            <button class="rounded-lg border-2 border-gray-200 shadow-lg flex flex-row justify-start items-center pr-3 mr-5 hover:bg-blue-500 hover:border-blue-800 group hover:text-white transition-all duration-300 ease-in-out" on:click={async () => {
                toast.push('Creating...');
                let created = await pb.collection('links').create({
                    'slug': await genSlug(12),
                    'long': 'https://example.com/',
                    'domain': data.domains[0].id,
                    'features': {
                        'customandroid': false,
                        'customios': false,
                        'customog': false,
                        'expiration': false,
                        'password': false
                    },
                    'owner': $auth.id,
                    'tags': [],
                });
                data.links = await pb.collection('links').getFullList(200, {
                    filter: `owner = "${pb.authStore.model?.id}"`,
                    expand: 'domain'
                });
                tab = 'editor';
                elink = JSON.parse(JSON.stringify(data.links.find(a => a.id == created.id)));
                toast.push('Created!');
            }}>
                <img src="/assets/img/add-outline.svg" class="w-10 p-2 aspect-square group-hover:invert transition-all duration-300 ease-in-out" alt="Plus" />
                <h2>Create Link</h2>
            </button>

            <div class="rounded-lg flex-1 border-2 border-gray-200 shadow-lg flex flex-row justify-start items-center">
                <img src="/assets/img/search-outline.svg" class="w-10 p-2 aspect-square" alt="Search" />
                <input type="text" placeholder="Search..." class="rounded-lg w-full p-2 ring-blue-500 transition-shadow duration-300 ease-in-out active:ring-2 focus:ring-2" bind:value={input}>
            </div>
        </div>

        <div id="linksList" class="flex flex-col justify-start items-center w-full p-5 h-full max-h-full overflow-auto gap-5">
            {#each data.links.filter(a => `${a.slug}${a.long}${a.archived == true ? 'Archived' : a.features.expiration == true && new Date(a.expiration) <= Date.now() / 1000 ? 'Expired' : 'Active' }`.toUpperCase().indexOf(input.toUpperCase()) > -1) as link (link.id)}
                <div class="flex flex-row justify-center items-center w-full rounded-lg border-2 {link.archived == true ? 'border-gray-300' : link.features.expiration == true && new Date(link.expiration) <= Date.now() / 1000 ? 'border-orange-500' : 'border-green-500' } p-4">
                    <img src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={link.long}&size=256" alt="Favicon for Original Site" class="h-12 aspect-square rounded-full mr-5">
                    <h1 class="text-left flex-1">
                        <a class="text-lg" href="{link.expand.domain.protocol}{link.expand.domain.base}/{link.slug}">{link.expand.domain.base}/{link.slug}</a>
                        <br>
                        <a class="text-sm" href={link.long}>{link.long}</a>
                    </h1>
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square hover:bg-red-500 group transition-all duration-300 ease-in-out" on:click={async () => { if (confirm(`Are you sure you want to delete "${link.expand.domain.base}/${link.slug}"? This action can not be undone.`) == true) {
                        toast.push('Deleting...');
                        await pb.collection('links').delete(link.id);
                        data.links = await pb.collection('links').getFullList(200, {
                            filter: `owner = "${pb.authStore.model?.id}"`,
                            expand: 'domain'
                        });
                        if (elink?.id == link.id) elink = {};
                        toast.push('Deleted!');
                    } }}>
                        <img src="/assets/img/bin-outline.svg" class="w-6 aspect-square group-hover:invert transition-all duration-300 ease-in-out" alt="Bin" />
                    </button>
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { tab = 'clicks'; elink = JSON.parse(JSON.stringify(link)); }}>
                        <img src="/assets/img/bar-chart-outline.svg" class="w-6 aspect-square" alt="Bar Graph" />
                    </button>
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { tab = 'qrcode'; elink = JSON.parse(JSON.stringify(link)); }}>
                        <img src="/assets/img/qr-code-outline.svg" class="w-6 aspect-square" alt="QR Code" />
                    </button>
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { copy(`${link.expand.domain.protocol}${link.expand.domain.base}/${link.slug}`); toast.push('Copied!'); }}>
                        <img src="/assets/img/copy-outline.svg" class="w-6 aspect-square" alt="Copy" />
                    </button>
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { tab = 'editor'; elink = JSON.parse(JSON.stringify(link)); password = new Array(elink.passwordsalt.length + 1).join('*'); }}>
                        <img src="/assets/img/pencil-outline.svg" class="w-6 aspect-square" alt="Pencil" />
                    </button>
                </div>
                <!-- <button on:click={() => elink = link}>{link.slug}</button> -->
            {:else}
            <p class="text-xl">No Results.</p>
            {/each}
        </div>
    </div>

    <div class="flex flex-col justify-start items-center {elink?.id ? 'w-1/3' : 'w-0'} transition-all duration-500 ease-in-out overflow-hidden shrink-0 h-full border-l-2 border-gray-300">
        <div class="flex flex-row justify-between items-center w-full">
            {#if tab == 'editor' || tab == 'preview'}
            <button class="p-3 flex-1 text-lg rounded-br-lg transition-colors duration-300 ease-in-out {tab == 'editor' ? '' : 'bg-gray-300'}" on:click={() => tab = 'editor'}>Editor</button>
            <button class="p-3 flex-1 text-lg rounded-bl-lg transition-colors duration-300 ease-in-out {tab == 'preview' ? '' : 'bg-gray-300'}" on:click={() => tab = 'preview'}>Preview</button>
            {:else}
            <span class="flex-1 py-1"></span>
            {/if}
            <button class="p-3 text-lg bg-gray-300 hover:bg-red-400 transition-all duration-300 ease-in-out {tab == 'preview' ? 'rounded-bl-lg' : ''} aspect-square shrink-0 h-[3.25rem] flex justify-center items-center" on:click={() => elink = {}}>
                <img src="/assets/img/close-outline.svg" class="w-8 aspect-square" alt="Close" />
            </button>
        </div>

        {#if elink?.id}
        <div id="sidebarContent" class="flex flex-col justify-start items-center w-full p-5 h-full max-h-full overflow-y-scroll overflow-x-visible" class:hidden={tab != 'editor'}>
            <h1 class="text-xl font-bold w-full text-left mb-3">Editing {elink.expand.domain.protocol}{elink.expand.domain.base}/{elink.slug}</h1>
            
            <div class="flex flex-row justify-between items-center w-full shrink-0">
                <p class="mb-1 text-left flex-1 text-lg">Short Link</p>
                <button class="text-right text-gray-600" on:click={() => elink.slug = genSlug(12)}>Randomise</button>
            </div>
            <div class="flex flex-row justify-between items-center w-full shrink-0 mb-3 rounded-lg bg-gray-200">
                <select class="bg-transparent py-2 pl-2" bind:value={elink.domain}>
                    {#each data.domains as domain}
                        <option value={domain.id}>{domain.base}</option>
                    {/each}
                </select>
                <span class="mr-1">/</span>
                <input type="text" placeholder="slug" bind:value={elink.slug}>
            </div>

            <p class="mb-1 text-left w-full text-lg">Destination</p>
            <input type="text" placeholder="https://example.com/" bind:value={elink.long} class="mb-4">

            <button class="flex flex-row justify-between items-center w-full mb-4 transition-all duration-300 shrink-0 ease-in-out {elink.archived == true ? '' : ''}" on:click={() => elink.archived = !elink.archived}>
                <p class="text-left flex-1 text-lg {elink.archived == true ? 'text-black' : 'text-gray-500'}">{elink.archived == true ? '' : 'Not '}Archived</p>
                <div class="{elink.archived == true ? 'pl-7 bg-blue-500' : 'pl-1 bg-gray-200'} flex flex-row items-center w-[3rem] rounded-full p-1 transition-all duration-300 ease-in-out">
                    <span class="p-2 rounded-full bg-white aspect-square shadow-sm"></span>
                </div>
            </button>

            <UTMTagEditor bind:elink tag="Source"   placeholder="Facebook, Twitter" />
            <UTMTagEditor bind:elink tag="Medium"   placeholder="Social, Email" />
            <UTMTagEditor bind:elink tag="Campaign" placeholder="Christmas_Sale_2022" />
            <UTMTagEditor bind:elink tag="Term"     placeholder="Christmas_Tree" />
            <UTMTagEditor bind:elink tag="Content"  placeholder="Newsletter_1" />
            <a href="https://www.crazyegg.com/blog/utm-codes-guide-with-examples/" class="mb-4 w-full text-left" target="_blank" rel="noreferrer">UTM Guide</a>

            <button class="flex flex-row justify-between items-center w-full mb-4 transition-all duration-300 shrink-0 ease-in-out {elink.features.advanced == true ? '' : ''}" on:click={() => elink.features.advanced = !elink.features.advanced}>
                <p class="text-left flex-1 text-lg {elink.features.advanced == true ? 'text-black' : 'text-gray-500'}">{elink.features.advanced == true ? 'Advanced' : 'Simple'} Link</p>
                <div class="{elink.features.advanced == true ? 'pl-7 bg-blue-500' : 'pl-1 bg-gray-200'} flex flex-row items-center w-[3rem] rounded-full p-1 transition-all duration-300 ease-in-out">
                    <span class="p-2 rounded-full bg-white aspect-square shadow-sm"></span>
                </div>
            </button>

            <div class="pl-8 w-full">
                {#if elink.features.advanced == true}
                <OptionalFeature label="Password Protection" bind:enabled={elink.features.password}>
                    <input type="password" placeholder="************" bind:value={password} minlength="8">
                </OptionalFeature>
    
                <OptionalFeature label="Custom Social Cards" bind:enabled={elink.features.customog}>
                    <p class="mb-1 text-left w-full">Title</p>
                    <input type="text" placeholder="Example Site" bind:value={elink.ogtitle} maxlength="120">
    
                    <p class="mb-1 mt-3 text-left w-full">Description</p>
                    <input type="text" placeholder="Example Site is a website about examples." bind:value={elink.ogdesc} maxlength="240">
    
                    <p class="mb-1 mt-3 text-left w-full">Image URL</p>
                    <input type="url" placeholder="https://example.com/img/example.png" bind:value={elink.ogimage}>
    
                    <img src={elink.ogimage} alt="Preview" class="h-[250px] w-full object-cover mt-5 rounded-lg">
                </OptionalFeature>
                {/if}
            </div>

            <OptionalFeature label="Expiration Date" bind:enabled={elink.features.expiration}>
                <input type="datetime-local" min={new Date().toISOString().split(':').slice(0, 2).join(':')} step="60" bind:value={elink.expiration}>
                <!-- <input type="datetime-local" placeholder={new Date().toISOString().split('Z')[0]} bind:value={elink.expiration} min={new Date().toISOString().split('Z')[0]} pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"> -->
            </OptionalFeature>

            <OptionalFeature label="Android Targeting" bind:enabled={elink.features.customandroid}>
                <input type="text" placeholder="https://example.com/" bind:value={elink.androidlink}>
            </OptionalFeature>

            <OptionalFeature label="iOS Targeting" bind:enabled={elink.features.customios}>
                <input type="text" placeholder="https://example.com/" bind:value={elink.ioslink}>
            </OptionalFeature>
        </div>

        <div class="flex flex-col justify-start items-center w-full p-5 h-full max-h-full overflow-auto" class:hidden={tab != 'preview'}>
            <p class="w-full text-left mb-2 text-lg">Twitter</p>
            <div class="overflow-hidden rounded-md border border-gray-300 w-full cursor-pointer mb-5 shrink-0">
                <img src={metatags.image || 'https://via.placeholder.com/150.png'} alt="Preview" class="h-[250px] w-full border-b border-gray-300 object-cover">
                <div class="grid gap-1 p-3">
                    <p class="text-sm text-[#536471]">{elink.expand.domain.base}</p>
                    <h3 class="truncate text-sm text-[#0f1419]">{metatags.title}</h3>
                    <p class="text-sm text-[#536471] line-clamp-2">{metatags.description}</p>
                </div>
            </div>

            <p class="w-full text-left mb-2 text-lg">Facebook</p>
            <div class="border border-gray-300 w-full cursor-pointer shrink-0">
                <img src={metatags.image || 'https://via.placeholder.com/150.png'} alt="Preview" class="h-[250px] w-full border-b border-gray-300 object-cover">
                <div class="grid gap-1 bg-[#f2f3f5] p-3">
                    <p class="text-[0.8rem] uppercase text-[#606770]">{elink.expand.domain.base}</p>
                    <h3 class="truncate font-semibold text-[#1d2129]">{metatags.title}</h3>
                    <p class="text-sm text-[#606770] line-clamp-2">{metatags.description}</p>
                </div>
            </div>
        </div>

        <div class="w-full flex flex-col justify-center items-center px-5">
            <button class="px-2 w-full bg-blue-500 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 ease-in-out {unsaved == true ? 'h-11 my-5 py-2' : 'h-0 my-0 py-0'}" on:click={async () => {
                saveMsg = 'Saving...';
                await encryptPassword();
                await pb.collection('links').update(elink.id, elink);
                elink = await pb.collection('links').getOne(elink.id, {
                    filter: `owner = "${pb.authStore.model?.id}"`,
                    expand: 'domain'
                });
                data.links = await pb.collection('links').getFullList(200, {
                    filter: `owner = "${pb.authStore.model?.id}"`,
                    expand: 'domain'
                });
                saveMsg = 'Save Changes';
                toast.push('Saved Successfully!');
            }}>{saveMsg}</button>
        </div>

        <div id="qrcode" class="flex flex-col justify-start items-center w-full p-5 h-full max-h-full overflow-auto" class:hidden={tab != 'qrcode'}>
            <QRCodeGenerator bind:elink />
        </div>

        <div id="clicks" class="flex flex-col justify-start items-center w-full px-5 pb-5 h-full max-h-full overflow-auto" class:hidden={tab != 'clicks'}>
            <div class="flex flex-row justify-between items-center w-full p-5 bg-white z-50 sticky top-0 cursor-pointer">
                <div class="flex-1">
                    <p class="w-full text-center">Total Clicks</p>
                    <h1 class="text-xl w-full text-center">{eclicks.length}</h1>
                </div>
                <div class="flex-1">
                    <p class="w-full text-center">Last 7 Days</p>
                    <h1 class="text-xl w-full text-center">{eclicks.filter(a => a.timestamp > ((Date.now() / 1000) - 604800)).length}</h1>
                </div>
                <div class="flex-1">
                    <p class="w-full text-center">Last 30 Days</p>
                    <h1 class="text-xl w-full text-center">{eclicks.filter(a => a.timestamp > ((Date.now() / 1000) - 2592000)).length}</h1>
                </div>
            </div>
            <div class="flex flex-row justify-between items-center w-full mb-5 cursor-pointer">
                <div class="flex-1">
                    <p class="w-full text-center">Web Clicks</p>
                    <h1 class="text-xl w-full text-center">{eclicks.filter(a => a.ua.getOS().name != 'Android' && a.ua.getOS().name != 'iOS').length}</h1>
                </div>
                <div class="flex-1">
                    <p class="w-full text-center">Android Clicks</p>
                    <h1 class="text-xl w-full text-center">{eclicks.filter(a => a.ua.getOS().name == 'Android').length}</h1>
                </div>
                <div class="flex-1">
                    <p class="w-full text-center">iOS Clicks</p>
                    <h1 class="text-xl w-full text-center">{eclicks.filter(a => a.ua.getOS().name == 'iOS').length}</h1>
                </div>
            </div>

            {#each eclicks.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1) as click}
                <p class="w-full text-left font-code text-xs 2xl:text-sm mt-2"><span title={new Date(click.timestamp * 1000).toISOString()}>{dtLocal(new Date(click.timestamp * 1000))}</span> - {click.ua.getOS().name}: <span title="{click.ua.getBrowser().major} - {click.ua.getBrowser().version}">{click.ua.getBrowser().name}</span> - {click.referrer || 'null'}</p>
                <!-- {#if click.referrer}<p class="w-full text-left font-code text-sm">Ref: {click.referrer}</p>{/if} -->
            {/each}
        </div>
        {/if}
    </div>
</div>

<button class="hidden button active">
    <span class="toggle"></span>
</button>

<style>
    * {
        outline: none
    }

    a {
        @apply text-blue-600;
    }
    a:hover {
        @apply underline;
    }

    #sidebarContent input {
        @apply w-full p-2 rounded-lg bg-gray-100 ring-blue-500 transition-shadow duration-300 ease-in-out;
    }
    #sidebarContent input:active, #sidebarContent input:focus {
        @apply ring-2;
    }
</style>