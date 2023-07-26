import { pb } from '$lib/database.js';
import { redirect } from '@sveltejs/kit';
import Parser from 'ua-parser-js';
import { getMetaTags } from '$lib/server/metatags.js';

export async function load(req) {
    const slug = req.params.slug || '_root';
    const resultList = await pb.collection('links').getList(1, 10, {
        filter: `slug = "${slug}" && domain.base = "${req.url.host}"`,
        expand: 'domain'
    });
    const link = resultList.items[0];

    if (link) {
        if (!req.request.headers.get('IzURL-No-Track')) {
            pb.collection('clicks').create({
                'link': link.id,
                'useragent': req.request.headers.get('User-Agent'),
                'referrer': req.request.headers.get('referer'),
                'timestamp': Date.now() / 1000
            });
        };

        if (link.archived == true) {
            return { 'type': 'failed', 'code': 307, 'url': req.url.origin + '/result/archived' };
        };

        if (link.features.expiration == true && new Date(link.expiration) <= Date.now() / 1000) {
            return { 'type': 'failed', 'code': 307, 'url': req.url.origin + '/result/expired' };
        };

        if (link.features.advanced != true) {
            if (ua.getOS().name == 'Android' && link.features.customandroid) {
                throw redirect(307, link.androidlink);
            } else if (ua.getOS().name == 'iOS' && link.features.customios) {
                throw redirect(307, link.ioslink);
            } else {
                throw redirect(307, link.long);
            };
        }

        const metatags = await getMetaTags(link.long);

        let ua = new Parser(req.request.headers.get('User-Agent'));
        if (ua.getOS().name == 'Android' && link.features.customandroid) {
            return { 'type': 'redirect', 'code': 307, 'url': link.androidlink, 'metatags': metatags, 'link': JSON.parse(JSON.stringify(link)) };
        } else if (ua.getOS().name == 'iOS' && link.features.customios) {
            return { 'type': 'redirect', 'code': 307, 'url': link.ioslink, 'metatags': metatags, 'link': JSON.parse(JSON.stringify(link)) };
        } else {
            return { 'type': 'redirect', 'code': 307, 'url': link.long, 'metatags': metatags, 'link': JSON.parse(JSON.stringify(link)) };
        };
    } else {
        return { 'type': 'failed', 'code': 307, 'url': req.url.origin + '/result/missing' };
    };
}