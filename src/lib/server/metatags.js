import { JSDOM } from 'jsdom';

async function getHtml(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout if it takes longer than 5 seconds
    return await fetch(url, {
        signal: controller.signal,
        headers: {
            'User-Agent': 'izurl-bot/1.0',
        },
    }).then((res) => {
        clearTimeout(timeoutId);
        return res.text();
    });
};

function getHeadChildNodes(html) {
    let dom = new JSDOM(html, {
        contentType: 'text/html',
        pretendToBeVisual: true
    }).window.document.head;
    
    const metaTags = [...dom.childNodes].filter(a => a.tagName == 'META').map(({attributes}) => {
        const property = attributes.property?.value || attributes.name || attributes.href;
        return {
            property,
            content: attributes.content?.value,
        };
    });
    const title = [...dom.childNodes].find(a => a.tagName == 'TITLE')?.innerText || '';
    const linkTags = [...dom.childNodes].filter(a => a.tagName == 'LINK').map(({ attributes }) => {
        const { rel, href } = attributes;
        return {
            rel,
            href,
        };
    });
  
    return { metaTags, title, linkTags };
    // return false;
};

function getRelativeUrl(url, imageUrl) {
    if (!imageUrl) {
        return null;
    }
    const { protocol, host } = new URL(url);
    const baseURL = `${protocol}//${host}`;
    return new URL(imageUrl, baseURL).toString();
};

export async function getMetaTags(url) {
    const html = await getHtml(url);
    const { metaTags, title: titleTag, linkTags } = getHeadChildNodes(html);
  
    let object = {};
  
    for (let k in metaTags) {
        let { property, content } = metaTags[k];
  
        property && (object[property] = content);
    }
  
    for (let m in linkTags) {
        let { rel, href } = linkTags[m];
  
        rel && (object[rel] = href);
    }
  
    const title = object['og:title'] || object['twitter:title'] || titleTag;
  
    const description =
        object['description'] ||
        object['og:description'] ||
        object['twitter:description'];
  
    const image =
        object['og:image'] ||
        object['twitter:image'] ||
        object['image_src'] ||
        object['icon'] ||
        object['shortcut icon'];
  
    return {
        title,
        description,
        image: getRelativeUrl(url, image),
    };
};