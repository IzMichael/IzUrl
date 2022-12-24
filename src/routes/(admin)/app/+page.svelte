<svelte:head>
    <title>IzURL</title>
</svelte:head>

<script>
    // export let data;

    import Header from '$lib/Header.svelte';
    import { auth, pb } from '$lib/database.js';

    let email, password;

    async function login() {
        await pb.collection('users').authWithPassword(email, password);
    };

    function logout() {
        pb.authStore.clear();
    }
</script>

<Header />

<div class="flex flex-col p-2 w-1/3 mx-auto mt-10">
    {#if $auth?.id}
        <p class="text-xl font-bold text-center">Logged in as {$auth.username} ({$auth.email})</p>
        <button on:click={() => logout()}>Log Out</button>
    {:else}
        <input type="text" bind:value={email} placeholder="Email">
        <input type="password" bind:value={password} placeholder="Password">
        <button on:click={() => login()}>Log In</button>
    {/if}
</div>

<style>
    * {
        outline: none
    }

    button {
        @apply w-full text-center p-2 px-5 text-white font-bold mt-2 text-lg bg-blue-500 rounded-lg;
    }
    button:hover {
        @apply bg-blue-400;
    }

    input {
        @apply w-full mb-3 p-2 rounded-lg bg-gray-100 ring-blue-500 transition-shadow duration-300 ease-in-out;
    }
    input:active, input:focus {
        @apply ring-2;
    }
</style>