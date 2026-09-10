export function getFaClassForImage(image) {
    let imgLower = image.toLowerCase();
    if (imgLower.includes('mysql') || imgLower.includes('postgres') || imgLower.includes('mongo') || imgLower.includes('redis') || imgLower.includes('db')) {
        return 'fa-solid fa-database';
    } else if (imgLower.includes('nginx') || imgLower.includes('apache') || imgLower.includes('httpd')) {
        return 'fa-solid fa-globe';
    } else if (imgLower.includes('node') || imgLower.includes('python') || imgLower.includes('php') || imgLower.includes('ruby') || imgLower.includes('golang')) {
        return 'fa-solid fa-code';
    } else if (imgLower.includes('ubuntu') || imgLower.includes('alpine') || imgLower.includes('debian') || imgLower.includes('centos')) {
        return 'fa-brands fa-linux';
    } else if (imgLower.includes('router') || imgLower.includes('proxy') || imgLower.includes('haproxy')) {
        return 'fa-solid fa-network-wired';
    }
    return 'fa-solid fa-server';
}

export function getIconForImage(image, color) {
    let imgLower = image.toLowerCase();
    
    // SVG Paths
    const paths = {
        db: 'M448 80c0 44.2-100.3 80-224 80S0 124.2 0 80 100.3 0 224 0s224 35.8 224 80zM0 192c0 44.2 100.3 80 224 80s224-35.8 224-80v-42.7c-54.7 33-134.1 50.7-224 50.7S54.7 182.3 0 149.3V192zM0 320c0 44.2 100.3 80 224 80s224-35.8 224-80v-42.7c-54.7 33-134.1 50.7-224 50.7S54.7 310.3 0 277.3V320zM448 448c0 44.2-100.3 80-224 80S0 492.2 0 448v-42.7c54.7 33 134.1 50.7 224 50.7s169.3-17.7 224-50.7V448z',
        web: 'M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64h185.4c2.2 20.4 3.3 41.8 3.3 64zm28.8-64h123.1c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-41.8 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 41.8-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM321.4 503.6c25.4-34.2 45.2-87.7 55.3-151.6h116.7c-29.9 74.1-93.6 130.9-172 151.6zM190.6 503.6c-78.3-20.7-142-77.5-171.9-151.6h116.7c10 63.9 29.8 117.4 55.3 151.6z',
        code: 'M64 32C28.7 32 0 60.7 0 96v256c0 35.3 28.7 64 64 64h171.5c-4 9.6-6.1 19.9-6.1 30.6c0 14.7 4.1 28.5 11.2 40.3c-1.5 .7-3.1 1.1-4.8 1.1H133.5c-6.8 0-12.7-4.5-14.5-11.1L96.2 376c-3.7-14.7-18.7-23.7-33.4-20S39.1 374.7 42.8 389.4l26.9 107.7C74.6 516.8 93.1 530 114 530h121.8c-6-11.7-9.8-24.9-9.8-39c0-11.6 2.3-22.7 6.4-33c-2.4-2.1-4.6-4.5-6.6-7h-162V96h384v222.1c25.4 7.6 47 23.3 62.4 43.9V96c0-35.3-28.7-64-64-64H64zm432 378c0 48.6-39.4 88-88 88s-88-39.4-88-88s39.4-88 88-88s88 39.4 88 88zm-56.9-23.1c-3.1-3.1-8.2-3.1-11.3 0L384 430.7l-43.8-43.8c-3.1-3.1-8.2-3.1-11.3 0s-3.1 8.2 0 11.3l49.5 49.5c3.1 3.1 8.2 3.1 11.3 0l49.5-49.5c3.1-3.1 3.1-8.2 0-11.3z',
        linux: 'M332.2 419c-8.6 3.6-18.4 5-28.2 5s-19.6-1.4-28.2-5c-8.6-3.6-18.4-5-28.2-5s-19.6 1.4-28.2 5c-8.6 3.6-18.4 5-28.2 5s-19.6-1.4-28.2-5c-6.8-2.8-13.9-3.7-21-3.2c-3.1 12.8-5 26-5.4 39.5c-1 30.6 6.3 59 18.2 81.3c15 28 35.5 45.4 56.6 45.4c17.3 0 34.6-12.5 49-30.7c14.4 18.2 31.7 30.7 49 30.7c21.2 0 41.7-17.4 56.6-45.4c11.9-22.3 19.3-50.7 18.2-81.3c-.4-13.5-2.3-26.7-5.4-39.5c-7.1-.5-14.2 .4-21 3.2zM256 0c-44.2 0-80 35.8-80 80c0 17.1 5.3 33 14.3 46.1C164.2 141.5 160 159.2 160 176v64c0 30.9-25.1 56-56 56H88c-13.3 0-24 10.7-24 24s10.7 24 24 24h16c44.2 0 80-35.8 80-80V200c0-13.3 10.7-24 24-24s24 10.7 24 24v64c0 30.9-25.1 56-56 56H160c-13.3 0-24 10.7-24 24s10.7 24 24 24h16c44.2 0 80-35.8 80-80V200c0-13.3 10.7-24 24-24s24 10.7 24 24v64c0 30.9-25.1 56-56 56H232c-13.3 0-24 10.7-24 24s10.7 24 24 24h16c44.2 0 80-35.8 80-80V176c0-16.8-4.2-34.5-30.3-49.9c9-13.1 14.3-29 14.3-46.1c0-44.2-35.8-80-80-80z',
        network: 'M320 32c0-17.7-14.3-32-32-32H224c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h11.2l-37.4 74.8c-8.9 17.8-27.4 29.2-47.3 29.2H128C57.3 204 0 261.3 0 332v16c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V268c0-17.7-14.3-32-32-32H64c14.2 0 27-6 36-15.6c11.6-12.4 26.6-21.3 43-26l32-9c17.5-4.9 33.1-14.4 46.2-27.5L256 128V192c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-64c0-17.7-14.3-32-32-32h-32V32z',
        server: 'M64 32C28.7 32 0 60.7 0 96v64c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm48 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM0 288v64c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64v-64c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64zm344 48a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm72-24a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z'
    };
    
    let path = paths.server;
    if (imgLower.includes('mysql') || imgLower.includes('postgres') || imgLower.includes('mongo') || imgLower.includes('redis') || imgLower.includes('db')) path = paths.db;
    else if (imgLower.includes('nginx') || imgLower.includes('apache') || imgLower.includes('httpd')) path = paths.web;
    else if (imgLower.includes('node') || imgLower.includes('python') || imgLower.includes('php') || imgLower.includes('ruby') || imgLower.includes('golang')) path = paths.code;
    else if (imgLower.includes('ubuntu') || imgLower.includes('alpine') || imgLower.includes('debian') || imgLower.includes('centos')) path = paths.linux;
    else if (imgLower.includes('router') || imgLower.includes('proxy') || imgLower.includes('haproxy')) path = paths.network;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="${color}"><path d="${path}"/></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
