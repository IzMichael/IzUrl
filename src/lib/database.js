import { writable } from 'svelte/store';
import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://db.izmm.eu');
pb.autoCancellation(false);
export const auth = writable(pb.authStore.model);
pb.authStore.onChange(user => {
    console.log('authStore changed', user);
    auth.set(pb.authStore.model);
});

if (pb.authStore.model?.username) {
    pb.collection('users').authRefresh();
};