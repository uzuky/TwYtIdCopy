// ==UserScript==
// @name         Twitch User ID Copier and img Searcher
// @namespace    https://github.com/uzuky
// @version      1.0
// @description:ja  ユーザー名の横に🌱が出現して、クリックするとユーザーIDでスレ検索ができます
// @description:ja2 📋️をクリックするとユーザーIDのコピーができます
// @description:ja3 オフラインのチャンネルではうまく動作しないかもしれません
// @author       uzuky
// @updateURL    https://github.com/uzuky/TwYtIdCopy/raw/main/TwIdCopy.user.js
// @license      MIT
// @match        https://www.twitch.tv/*
// @match        https://img.2chan.net/b/futaba.php?mode=cat
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_setClipboard
// ==/UserScript==

(() => {
    'use strict';

    const STORAGE_KEY = 'TwitchID_userId';

    const createIconButton = (icon, tooltip, onClick) => {
        const button = document.createElement("span");
        button.textContent = icon;
        button.style.cursor = "pointer";
        button.style.fontSize = "larger";
        button.title = tooltip;
        button.addEventListener("click", onClick);
        return button;
    };

    const addButtonsToElement = targetElement => {
        const userId = targetElement.href.split("/").pop();

        const copyIcon = createIconButton("📋️", "IDをコピー", () => {
            GM_setClipboard(userId);
            copyIcon.textContent = "✅";
            setTimeout(() => { copyIcon.textContent = "📋️"; }, 500);
        });

        const searchIcon = createIconButton("🌱", "imgでスレを検索 (IDはコピーされません)", () => {
            GM_setValue(STORAGE_KEY, userId);
            GM_openInTab('https://img.2chan.net/b/futaba.php?mode=cat', { active: true });
        });

        targetElement.parentNode.insertBefore(copyIcon, targetElement.nextSibling);
        targetElement.parentNode.insertBefore(searchIcon, copyIcon.nextSibling);
    };

    const addButtons = () => {
        const targetElements = document.querySelectorAll(".Layout-sc-1xcs6mc-0.jjAyLi a[href^='/'], .Layout-sc-1xcs6mc-0.hdoiLi a[href^='/']"); //チャンネルのトップページと、配信画面のページの両方の要素
        if (targetElements.length === 0) {
            console.error('ボタンを配置するための要素が見つかりませんでした');
            return;
        }

        targetElements.forEach(addButtonsToElement);
    };

    if (window.location.hostname === "www.twitch.tv") {
        window.addEventListener('load', () => setTimeout(addButtons, 1500)); //遅延させないとなにかに上書きされて消えちゃう
    } else if (window.location.hostname === "img.2chan.net") {
        window.addEventListener('load', async () => {
            const userId = await GM_getValue(STORAGE_KEY, "");
            if (userId) {
                const input = document.querySelector('#hml input[name="keyword"]');
                const searchButton = document.querySelector('#hml input[type="submit"]');
                if (input && searchButton) {
                    input.value = userId;
                    searchButton.click();
                    await GM_setValue(STORAGE_KEY, ""); // 検索後に値をクリアする
                } else {
                    console.error('検索ボックスが見つかりませんでした');
                }
            } else {
                console.log('Twitch IDが設定されていないため、スクリプトは実行されません');
            }
        });
    }
})();
