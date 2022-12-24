import { pb } from '$lib/database.js';

export async function load() {
    const links = await pb.collection('links').getFullList(200, {
        filter: `owner = "${pb.authStore.model?.id}"`,
        expand: 'domain'
    });
    const domains = await pb.collection('domains').getFullList(200, {
        filter: `owner = "${pb.authStore.model?.id}"`
    });
    return { 'links': JSON.parse(JSON.stringify(links)), 'domains': JSON.parse(JSON.stringify(domains)) };
}