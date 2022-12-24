<script>
    export let elink = {}, tag = '', placeholder = '';
</script>

<div class="flex flex-row justify-between items-center w-full shrink-0 mb-3 rounded-lg bg-gray-200">
    <p class="px-2 no-wrap w-1/3 text-right">UTM {tag}</p>
    <input type="text" {placeholder} value={new URL(elink.long).searchParams.get('utm_' + tag.toLowerCase())} on:keyup={(e) => {
        var url = new URL(elink.long);
        if (e.target.value.replaceAll(' ', '_').length > 0) {
            url.searchParams.set('utm_' + tag.toLowerCase(), e.target.value.replaceAll(' ', '_'));
        } else {
            url.searchParams.delete('utm_' + tag.toLowerCase());
        };
        elink.long = url.toString();
    }} class="flex-1">
</div>

<style>
    * {
        outline: none
    }

    input {
        @apply w-full p-2 rounded-lg bg-gray-100 ring-blue-500 transition-shadow duration-300 ease-in-out;
    }
    input:active, input:focus {
        @apply ring-2;
    }
</style>