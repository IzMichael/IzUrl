<script>
    // import QRCodeStyling from 'qr-code-styling';
    import { onMount } from 'svelte';
    export const ssr = false;
    export let elink = {};

    let QRCodeStyling, canvasWrapper, qrCode;

    function generate() {
        if (QRCodeStyling) {
            qrCode = new QRCodeStyling(qroptions);

            if ([...canvasWrapper?.childNodes].length > 0) {
                canvasWrapper.removeChild(canvasWrapper.querySelector('svg'));
            };
            qrCode.append(canvasWrapper);
            // qrCode.download({ name: 'qrcode', extension: 'png' });
        };
    };

    let qroptions = {
        width: 256,
        height: 256,
        type: 'svg',
        data: elink.expand.domain.protocol + elink.expand.domain.base + '/' + elink.slug,
        image: '',
        dotsOptions: {
            color: '#000000',
            type: 'square'
        },
        cornersSquareOptions: {
            color: '#000000',
            type: 'square'
        },
        cornersDotOptions: {
            color: '#000000',
            type: 'square'
        },
        backgroundOptions: {
            color: '#ffffff',
        },
        imageOptions: {
            crossOrigin: 'anonymous',
            margin: 0,
            saveAsBlob: true,
        },
        qrOptions: {
            errorCorrectionLevel: 'H'
        }
    };

    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, (s * 1000)));
    };

    onMount(async () => {
        if (typeof window != 'undefined') {
            // await sleep(1);
            QRCodeStyling = (await import('qr-code-styling')).default;
            if (elink?.id && canvasWrapper) generate(elink, qroptions);
        };
    })
    $: if (elink?.id && canvasWrapper) generate(elink, qroptions);

    async function convertToBase64(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                resolve({
                    fileName: file.name,
                    result: e.target.result, 
                    error: e.target.error
                });
            };   
            reader.readAsDataURL(file);
        }.bind(file)); 
    };

    function copyQR() {
        navigator.clipboard.write([
            new ClipboardItem({
                'image/png': qrCode.getRawData('png')
            })
        ]);
    };
</script>

<div class="px-5 w-full flex flex-row justify-center items-center shrink-0 min-h-[256px]" bind:this={canvasWrapper}>

</div>

<div class="flex flex-row justify-between items-center w-full gap-5 mt-5 mb-5">
    <button class="p-2 flex-1 bg-blue-500 text-white font-bold rounded-lg" on:click={() => copyQR()}>Copy Image</button>
    <button class="p-2 flex-1 bg-blue-500 text-white font-bold rounded-lg" on:click={() => qrCode.download({ name: 'QRCode', extension: 'png' })}>Download Image</button>
</div>

<p>Background</p>
<input type="color" bind:value={qroptions.backgroundOptions.color}>

<p>Central Logo (Optional)</p>
<input type="file" accept="image/*" on:change={async (e) => convertToBase64(e.target.files[0]).then(res => qroptions.image = res.result)}>

<p>Internal Grid</p>
<div class="flex flex-row justify-between items-center w-full gap-5">
    <select bind:value={qroptions.dotsOptions.type}>
        <option value="square">Squares</option>
        <option value="dots">Dots</option>
        <option value="rounded">Rounded</option>
        <option value="classy">Classy</option>
        <option value="classy-rounded">Classy Rounded</option>
        <option value="extra-rounded">Extra Rounded</option>
    </select>
    <input type="color" bind:value={qroptions.dotsOptions.color}>
</div>

<p>Corner Outlines</p>
<div class="flex flex-row justify-between items-center w-full gap-5">
    <select bind:value={qroptions.cornersSquareOptions.type}>
        <option value="square">Squares</option>
        <option value="dot">Dots</option>
        <option value="extra-rounded">Extra Rounded</option>
    </select>
    <input type="color" bind:value={qroptions.cornersSquareOptions.color}>
</div>

<p>Corner Inners</p>
<div class="flex flex-row justify-between items-center w-full gap-5">
    <select bind:value={qroptions.cornersDotOptions.type}>
        <option value="square">Squares</option>
        <option value="dot">Dots</option>
    </select>
    <input type="color" bind:value={qroptions.cornersDotOptions.color}>
</div>

<canvas class="hidden"></canvas>

<style>
    * {
        outline: none;
    }

    *:not(div input, div select) {
        flex-shrink: 0;
    }

    canvas {
        width: 100%;
    }

    p {
        @apply w-full text-left mb-1;
    }

    input, select {
        @apply w-full p-2 mb-3 rounded-lg bg-gray-100 ring-blue-500 transition-shadow duration-300 ease-in-out;
    }
    input:active, input:focus, select:active, select:focus {
        @apply ring-2;
    }

    input[type=color] {
        @apply py-1 h-10;
    }
</style>