<svelte:head>
    <script defer data-domain="izmm.eu" src="https://analytics.izmichael.com/js/script.js"></script>

    {#if data.link?.features.customog == true}
        <!-- Primary Meta Tags -->
        <title>{data.link.ogtitle}</title>
        <meta name="title" content="{data.link.ogtitle}">
        <meta name="description" content="{data.link.ogdesc}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{data.link?.expand.domain.protocol}{data.link.expand.domain.base}/{data.link.slug}">
        <meta property="og:title" content="{data.link.ogtitle}">
        <meta property="og:description" content="{data.link.ogdesc}">
        <meta property="og:image" content="{data.link.ogimage}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{data.link?.expand.domain.protocol}{data.link.expand.domain.base}/{data.link.slug}">
        <meta property="twitter:title" content="{data.link.ogtitle}">
        <meta property="twitter:description" content="{data.link.ogdesc}">
        <meta property="twitter:image" content="{data.link.ogimage}">
    {:else}
        <!-- Primary Meta Tags -->
        <title>{data.metatags?.title}</title>
        <meta name="title" content="{data.metatags?.title}">
        <meta name="description" content="{data.metatags?.description}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{data.link?.expand.domain.protocol}{data.link?.expand.domain.base}/{data.link?.slug}">
        <meta property="og:title" content="{data.metatags?.title}">
        <meta property="og:description" content="{data.metatags?.description}">
        <meta property="og:image" content="{data.metatags?.image}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{data.link?.expand.domain.protocol}{data.link?.expand.domain.base}/{data.link?.slug}">
        <meta property="twitter:title" content="{data.metatags?.title}">
        <meta property="twitter:description" content="{data.metatags?.description}">
        <meta property="twitter:image" content="{data.metatags?.image}">
    {/if}
</svelte:head>

<script>
    export let data;
    import { onMount } from 'svelte';
    import jsSHA from 'jssha';

    onMount(() => {
        if (data.type == 'failed') {
            window.location = data.url;
        };
        // data.link = JSON.parse(data.link);
        if (data.link.features.password != true) {
            window.location = data.url;
        };
    });

    let password = '', err = '';
    // variableSalt = (Math.random().toString(36) + Math.random().toString(36)).slice(2, 10)
    function checkPassword() {
        const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
        shaObj.update(password + data.link.passwordsalt);
        const hash = shaObj.getHash('HEX');

        password = '';

        if (data.link.password == hash) {
            data.link.features.password = false;
            window.location = data.url;
        } else {
            err = 'Incorrect Password';
        };
    };
</script>

{#if data.link?.slug}
    {#if data.link.features.password != true}
        <p class="p-2">Redirecting... If you are not redirected, please <a href={data.url} class="text-blue-500 underline hover:no-underline">click here</a>.</p>
    {:else}
        <h1 class="text-xl font-bold text-center w-full">Password Required to view <span class="font-mono font-normal">{data.link.expand.domain.base}/{data.link.slug}</span></h1>
        <input type="password" bind:value={password} placeholder="********" class="p-2 rounded-lg w-full bg-gray-100 ring-blue-500 my-3 active:ring-2 focus:ring-2 transition-all duration-300 ease-in-out">
        <button on:click={() => checkPassword()} class="bg-blue-500 p-2 rounded-lg w-full hover:bg-blue-400 text-white font-semibold transition-all duration-300 ease-in-out">Submit</button>
        {#if err.length > 0}<p class="text-red-600 font-bold mt-2">{err}</p>{/if}
    {/if}
{/if}

<style>
    * {
        outline: none;
    }
</style>