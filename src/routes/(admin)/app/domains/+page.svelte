<svelte:head>
    <title>IzURL</title>
</svelte:head>

<script>
    export let data;
    import { pb, auth } from '$lib/database.js';
    import { toast } from '@zerodevx/svelte-toast';

    import Header from '$lib/Header.svelte';

    let edom = {}, input = '';

    let unsaved = false, saveMsg = 'Save Changes';
    $: unsaved = !(JSON.stringify(data.domains.filter(a => a.id == edom.id)[0] ?? {}) == JSON.stringify(edom ?? {}));

    setInterval(async () => {
        checkDomain();
    }, 10000);

    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, (s * 1000)));
    };

    async function checkDomain() {
        if (edom?.id) {
            await sleep(1);
            let check = await fetch(edom.protocol + edom.base + '/app/health').then(res => { return res.json(); });
            if (check.code == 200 && check.status == 'ok') {
                edom.connected = true;
            };
        };
    };

    $: checkDomain(edom);
</script>

<div class="flex flex-row justify-center items-center w-screen h-screen overflow-hidden">
    <div class="flex flex-col justify-start items-center flex-1 h-full">
        <Header />

        <div class="px-5 pt-5 w-full flex flex-row justify-between items-center">
            <button class="rounded-lg border-2 border-gray-200 shadow-lg flex flex-row justify-start items-center pr-3 mr-5 hover:bg-blue-500 hover:border-blue-800 group hover:text-white transition-all duration-300 ease-in-out" on:click={async () => {
                toast.push('Creating...');
                let created = await pb.collection('domains').create({
                    'protocol': 'https://',
                    'base': 'example.com',
                    'owner': $auth.id
                });
                data.domains = await pb.collection('domains').getFullList(200);
                edom = JSON.parse(JSON.stringify(data.domains.find(a => a.id == created.id)));
                toast.push('Created!');
            }}>
                <img src="/assets/img/add-outline.svg" class="w-10 p-2 aspect-square group-hover:invert transition-all duration-300 ease-in-out" alt="Plus" />
                <h2>Add Domain</h2>
            </button>

            <div class="rounded-lg flex-1 border-2 border-gray-200 shadow-lg flex flex-row justify-start items-center">
                <img src="/assets/img/search-outline.svg" class="w-10 p-2 aspect-square" alt="Search" />
                <input type="text" placeholder="Search..." class="rounded-lg w-full p-2 ring-blue-500 transition-shadow duration-300 ease-in-out active:ring-2 focus:ring-2" bind:value={input}>
            </div>
        </div>

        <div id="domainsList" class="flex flex-col justify-start items-center w-full p-5 h-full max-h-full overflow-auto gap-5">
            {#each data.domains.filter(a => `${a.protocol}${a.base}`.toUpperCase().indexOf(input.toUpperCase()) > -1) as dom (dom.id)}
                <div class="flex flex-row justify-center items-center w-full rounded-lg border-2 {data.links.filter(a => a.domain == dom.id).length > 0 ? 'border-green-500' : 'border-gray-300' } p-4">
                    <!-- <img src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={link.long}&size=256" alt="Favicon for Original Site" class="h-12 aspect-square rounded-full mr-5"> -->
                    <h1 class="text-left flex-1">
                        <h1 class="text-lg">{dom.protocol}{dom.base}</h1>
                        <!-- <br>
                        <a class="text-sm" href={link.long}>{link.long}</a> -->
                    </h1>
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square hover:bg-red-500 group transition-all duration-300 ease-in-out" on:click={async () => { if (confirm(`Are you sure you want to delete "${dom.protocol}${dom.base}"? This action can not be undone.`) == true) {
                        toast.push('Deleting...');
                        await pb.collection('domains').delete(dom.id);
                        data.domains = await pb.collection('domains').getFullList(200, {
                            expand: 'domain'
                        });
                        if (edom?.id == dom.id) edom = {};
                        toast.push('Deleted!')
                    } }}>
                        <img src="/assets/img/bin-outline.svg" class="w-6 aspect-square group-hover:invert transition-all duration-300 ease-in-out" alt="Bin" />
                    </button>
                    
                    <!-- <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { tab = 'clicks'; elink = JSON.parse(JSON.stringify(link)); }}>
                        <img src="/assets/img/bar-chart-outline.svg" class="w-6 aspect-square" alt="Bar Graph" />
                    </button> -->
                    
                    <!-- <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { tab = 'qrcode'; elink = JSON.parse(JSON.stringify(link)); }}>
                        <img src="/assets/img/qr-code-outline.svg" class="w-6 aspect-square" alt="QR Code" />
                    </button> -->
                    
                    <!-- <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => { copy(`${link.expand.domain.protocol}${link.expand.domain.base}/${link.slug}`); toast.push('Copied!'); }}>
                        <img src="/assets/img/copy-outline.svg" class="w-6 aspect-square" alt="Copy" />
                    </button> -->
                    
                    <button class="ml-3 p-2 rounded-full bg-gray-100 flex justify-center items-center aspect-square" on:click={() => edom = JSON.parse(JSON.stringify(dom))}>
                        <img src="/assets/img/pencil-outline.svg" class="w-6 aspect-square" alt="Pencil" />
                    </button>
                </div>
                <!-- <button on:click={() => elink = link}>{link.slug}</button> -->
            {:else}
            <p class="text-xl">No Results.</p>
            {/each}
        </div>
    </div>

    <div class="flex flex-col justify-start items-center {edom?.id ? 'w-1/3' : 'w-0'} transition-all duration-500 ease-in-out overflow-hidden shrink-0 h-full border-l-2 border-gray-300">
        <div class="flex flex-row justify-between items-center w-full">
            <span class="flex-1 py-1"></span>
            <button class="p-3 text-lg bg-gray-300 hover:bg-red-400 transition-all duration-300 ease-in-out rounded-bl-lg aspect-square shrink-0 h-[3.25rem] flex justify-center items-center" on:click={() => edom = {}}>
                <img src="/assets/img/close-outline.svg" class="w-8 aspect-square" alt="Close" />
            </button>
        </div>

        {#if edom?.id}
        <div id="sidebarContent" class="flex flex-col justify-start items-center w-full p-5 h-full max-h-full overflow-y-scroll overflow-x-visible">
            <h1 class="text-xl font-bold w-full text-left mb-3">Editing {edom.protocol}{edom.base}</h1>
            <div class="flex flex-row justify-between items-center w-full shrink-0 mb-3 rounded-lg bg-gray-200">
                <select class="bg-transparent py-2 pl-2" bind:value={edom.protocol}>
                    <option>http://</option>
                    <option>https://</option>
                </select>
                <input type="text" placeholder="example.com" bind:value={edom.base}>
            </div>

            <p class="text-xl mt-2 w-full text-left {edom.connected == true ? 'text-green-500' : 'text-red-500'}">{edom.connected == true ? 'Domain Connected' : 'Domain Not Connected'}</p>
        </div>

        <div class="w-full flex flex-col justify-center items-center px-5">
            <button class="px-2 w-full bg-blue-500 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 ease-in-out {unsaved == true ? 'h-11 my-5 py-2' : 'h-0 my-0 py-0'}" on:click={async () => {
                saveMsg = 'Saving...';
                let save = await pb.collection('domains').update(edom.id, edom);
                edom = await pb.collection('domains').getOne(edom.id);
                data.domains = await pb.collection('domains').getFullList(200);
                saveMsg = 'Save Changes';
                toast.push('Saved Successfully!');
            }}>{saveMsg}</button>
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

    #sidebarContent input {
        @apply w-full p-2 rounded-lg bg-gray-100 ring-blue-500 transition-shadow duration-300 ease-in-out;
    }
    #sidebarContent input:active, #sidebarContent input:focus {
        @apply ring-2;
    }
</style>