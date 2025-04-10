// ==UserScript==
// @name         MrGisterPlus
// @namespace    https://github.com/thesavant42/MrGisterPlus
// @version      1.5
// @description  GitHub profile enhancer: social links, favicons, HuggingFace API, export tools. Built for profile OSINT legends 
// @author       thesavant42
// @match        https://github.com/*
// @updateURL    https://raw.githubusercontent.com/thesavant42/mistergister/main/MrGisterPlus.user.js
// @downloadURL  https://raw.githubusercontent.com/thesavant42/mistergister/main/MrGisterPlus.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONTAINER_ID = 'mrgisterplus-container';
    const SECTION_ID = 'mrgisterplus-links';
    const EXPORT_BUTTON_ID = 'mrgisterplus-export';

    const PROFILE_URLS = [
        'https://gist.github.com/{{username}}',
        'https://hub.docker.com/u/{{username}}',
        'https://binarysearch.io/@/{{username}}',
        'https://bitbucket.org/{{username}}/',
        'https://codepen.io/{{username}}',
        'https://dev.to/{{username}}',
        'https://discuss.elastic.co/u/{{username}}',
        'https://disqus.com/{{username}}',
        'https://gitee.com/{{username}}',
        'https://github.community/u/{{username}}/summary',
        'https://gitlab.com/{{username}}',
        'https://keybase.io/{{username}}',
        'https://leetcode.com/{{username}}',
        'https://mastodon.cloud/@{{username}}',
        'https://mastodon.social/@{{username}}',
        'https://mastodon.technology/@{{username}}',
        'https://mastodon.xyz/@{{username}}',
        'https://mobile.twitter.com/{{username}}',
        'https://mstdn.io/@{{username}}',
        'https://pastebin.com/u/{{username}}',
        'https://pypi.org/user/{{username}}',
        'https://rubygems.org/profiles/{{username}}',
        'https://slideshare.net/{{username}}',
        'https://sourceforge.net/u/{{username}}',
        'https://trello.com/{{username}}',
        'https://www.codecademy.com/profiles/{{username}}',
        'https://www.codewars.com/users/{{username}}',
        'https://www.npmjs.com/~{{username}}',
        'https://www.patreon.com/{{username}}',
        'https://www.postman.com/{{username}}',
        'https://www.reddit.com/user/{{username}}',
        'https://www.scribd.com/{{username}}',
        'https://www.wikipedia.org/wiki/User:{{username}}',
        'https://xboxgamertag.com/search/{{username}}',
        'https://huggingface.co/api/users/{{username}}'
    ];

    function getGitHubUsername() {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const username = segments[0];
        return (segments.length === 1 && username !== 'gist') ? username : null;
    }

    function createLink(href) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'Link--primary';
        a.style.display = 'flex';
        a.style.alignItems = 'center';
        a.style.gap = '6px';
        a.style.marginBottom = '4px';

        const domain = href.split('/')[2];
        const img = document.createElement('img');
        img.src = `https://www.google.com/s2/favicons?domain=${domain}`;
        img.width = 16;
        img.height = 16;
        img.style.borderRadius = '3px';

        const label = document.createElement('span');
        label.textContent = domain;

        a.appendChild(img);
        a.appendChild(label);
        return a;
    }

    function createExportButton(links) {
        const btn = document.createElement('button');
        btn.id = EXPORT_BUTTON_ID;
        btn.textContent = '📤 Export Links';
        btn.style.marginTop = '8px';
        btn.style.padding = '4px 8px';
        btn.style.border = '1px solid var(--color-border-default)';
        btn.style.borderRadius = '4px';
        btn.style.background = 'var(--color-btn-bg)';
        btn.style.color = 'var(--color-btn-text)';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';

        btn.addEventListener('click', () => {
            const json = JSON.stringify(links, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'MrGisterPlus_links.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        return btn;
    }

    function createCollapsibleSection(username) {
        const wrapper = document.createElement('div');
        wrapper.id = SECTION_ID;

        const toggle = document.createElement('div');
        toggle.textContent = '▶️ MrGister+ Links';
        toggle.style.cursor = 'pointer';
        toggle.style.fontWeight = 'bold';
        toggle.style.marginBottom = '8px';

        const linkList = document.createElement('div');
        linkList.style.display = 'none';
        linkList.style.transition = 'all 0.3s ease';

        const links = PROFILE_URLS.map(template => template.replace(/{{username}}/g, username));
        for (const url of links) {
            linkList.appendChild(createLink(url));
        }

        linkList.appendChild(createExportButton(links));

        toggle.addEventListener('click', () => {
            const expanded = linkList.style.display === 'block';
            linkList.style.display = expanded ? 'none' : 'block';
            toggle.textContent = expanded ? '▶️ MrGister+ Links' : '🔽 MrGister+ Links';
        });

        wrapper.appendChild(toggle);
        wrapper.appendChild(linkList);
        return wrapper;
    }

    function createContainer(username) {
        const container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.style.marginTop = '16px';
        container.style.padding = '12px';
        container.style.border = '1px solid var(--color-border-default)';
        container.style.borderRadius = '6px';
        container.style.backgroundColor = 'var(--color-canvas-subtle)';
        container.style.color = 'var(--color-fg-default)';
        container.style.fontSize = '14px';

        container.appendChild(createCollapsibleSection(username));
        return container;
    }

    function inject() {
        const username = getGitHubUsername();
        if (!username) return false;

        const sidebar = document.querySelector('[data-view-component="true"][class*="Layout-sidebar"], aside[class*="Layout-sidebar"]');
        if (!sidebar || document.getElementById(CONTAINER_ID)) return false;

        const container = createContainer(username);
        sidebar.appendChild(container);
        return true;
    }

    function waitAndInject(tries = 10) {
        if (!inject() && tries > 0) {
            setTimeout(() => waitAndInject(tries - 1), 500);
        }
    }

    function setupNavigationHooks() {
        const hook = (originalFn) => function () {
            const result = originalFn.apply(this, arguments);
            setTimeout(waitAndInject, 250);
            return result;
        };

        history.pushState = hook(history.pushState);
        history.replaceState = hook(history.replaceState);
        window.addEventListener('popstate', () => setTimeout(waitAndInject, 250));
        document.addEventListener('pjax:end', () => setTimeout(waitAndInject, 250));
    }

    function setupObserver() {
        const observer = new MutationObserver(() => inject());
        observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
    }

    waitAndInject();
    setupNavigationHooks();
    setupObserver();
})();
