<script>
    import { page } from '$app/stores';
</script>

<div class="flex flex-row justify-center items-center w-full shadow-lg p-5">
    <h1 class="text-3xl font-bold flex-1 text-left">IzURL</h1>
    
    <a href="/app/domains" class:active={$page.url.pathname == '/app/domains'}>Domains</a>
    <a href="/app/links" class:active={$page.url.pathname == '/app/links'}>Links</a>
</div>

<style>
    a {
        @apply rounded-lg p-2 text-xl px-5 text-center ml-2;
    }

    a:hover {
        @apply bg-gray-100;
    }

    .active {
        @apply bg-gray-100;
    }
</style>