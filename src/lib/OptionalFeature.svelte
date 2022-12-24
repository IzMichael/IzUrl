<script>
    export let label = '', enabled = false;
    let content;
</script>

<button class="flex flex-row justify-between items-center w-full border-t border-gray-200 pt-4 transition-all duration-300 shrink-0 ease-in-out {enabled == true ? '' : 'mb-4'}" on:click={() => enabled = !enabled}>
    <p class="text-left flex-1 text-lg {enabled == true ? 'text-black' : 'text-gray-500'}">{label}</p>
    <div class="{enabled == true ? 'pl-7 bg-blue-500' : 'pl-1 bg-gray-200'} flex flex-row items-center w-[3rem] rounded-full p-1 transition-all duration-300 ease-in-out">
        <span class="p-2 rounded-full bg-white aspect-square shadow-sm"></span>
    </div>
</button>

<div bind:this={content} class="w-full {enabled == true ? 'pb-4 mt-3 pt-1' : ''} px-1 transition-all duration-300 shrink-0 ease-in-out overflow-y-hidden overflow-x-visible" style="{enabled == true ? 'max-height: ' + (content?.scrollHeight + 16) +  'px;' : 'max-height: 0;'}">
    <slot />
</div>

<style>

</style>