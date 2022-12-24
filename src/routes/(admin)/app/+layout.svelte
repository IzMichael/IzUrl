<script>
    import { SvelteToast } from '@zerodevx/svelte-toast';
    const options = {
        duration: 2000,       // duration of progress bar tween to the `next` value
        initial: 0,           // initial progress bar value
        next: 1,              // next progress value
        pausable: false,      // pause progress bar tween on mouse hover
        dismissable: true,    // allow dismiss with close button
        reversed: true,       // insert new toast to bottom of stack
        intro: { x: -256 },   // toast intro fly animation settings
        theme: {},            // css var overrides
        classes: []           // user-defined classes
    };

    import { pb } from '$lib/database.js';
    let guarded = ['/app/links', '/app/domains'];
    if (typeof window != 'undefined' && guarded.includes(window.location.pathname) && typeof pb.authStore.model?.username == 'undefined') {
        window.location.href = '/app';
    };
</script>

<slot />

<SvelteToast {options} />

<style>
    :root {
        --toastContainerTop: auto;
        --toastContainerRight: auto;
        --toastContainerBottom: 1.5rem;
        --toastContainerLeft: 2rem;
    }
</style>