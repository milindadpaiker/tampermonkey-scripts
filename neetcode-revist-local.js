// ==UserScript==
// @name         NeetCode Revisit Tagger
// @namespace    http://tampermonkey.net/
// @version      2025-02-13
// @description  Tag NeetCode problems for revisiting and list them on the center-top of the page.
// @author       You
// @match        https://neetcode.io/problems/*
// @match        https://leetcode.com/problems/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neetcode.io
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Utility functions for localStorage
    const getRevisitList = () => JSON.parse(localStorage.getItem('revisitList') || '[]');
    const saveRevisitList = (list) => localStorage.setItem('revisitList', JSON.stringify(list));

    // Function to dynamically update the problem URL
    function getCurrentProblemUrl() {
        return window.location.href;
    }

    // Add "Revisit" button to the problem page
    function addRevisitButton() {
        // Create a container for buttons at the center-top of the page
        let buttonContainer = document.querySelector('#revisit-button-container');
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.id = 'revisit-button-container';
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.top = '10px';
            buttonContainer.style.left = '50%';
            buttonContainer.style.transform = 'translateX(-50%)';
            buttonContainer.style.zIndex = '1000';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            document.body.appendChild(buttonContainer);
        }

        // Clear existing buttons (if any) to prevent duplicates
        buttonContainer.innerHTML = '';

        // Create a button to tag or untag the problem as "Revisit"
        const revisitButton = document.createElement('button');
        revisitButton.style.padding = '10px';
        revisitButton.style.backgroundColor = '#f39c12';
        revisitButton.style.color = '#fff';
        revisitButton.style.border = 'none';
        revisitButton.style.borderRadius = '5px';
        revisitButton.style.cursor = 'pointer';

        const updateRevisitButtonState = () => {
            const problemUrl = getCurrentProblemUrl(); // Dynamically get the current URL
            const revisitList = getRevisitList();

            if (revisitList.includes(problemUrl)) {
                // If already tagged, show "Untag as Revisit"
                revisitButton.innerText = 'Untag as Revisit';
                revisitButton.style.backgroundColor = '#e74c3c'; // Change color to red
                revisitButton.onclick = () => {
                    // Remove from revisit list
                    const updatedList = revisitList.filter((url) => url !== problemUrl);
                    saveRevisitList(updatedList);
                    alert('Problem untagged as Revisit!');
                    updateRevisitButtonState(); // Update button state
                };
            } else {
                // If not tagged, show "Tag as Revisit"
                revisitButton.innerText = 'Tag as Revisit';
                revisitButton.style.backgroundColor = '#f39c12'; // Change color to orange
                revisitButton.onclick = () => {
                    // Add to revisit list
                    revisitList.push(problemUrl);
                    saveRevisitList(revisitList);
                    alert('Problem tagged as Revisit!');
                    updateRevisitButtonState(); // Update button state
                };
            }
        };

        updateRevisitButtonState(); // Initialize button state

        buttonContainer.appendChild(revisitButton);
    }

    // Add a "Revisit List" button on the center-top of the page
    function addRevisitListButton() {
        let buttonContainer = document.querySelector('#revisit-button-container');
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.id = 'revisit-button-container';
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.top = '10px';
            buttonContainer.style.left = '50%';
            buttonContainer.style.transform = 'translateX(-50%)';
            buttonContainer.style.zIndex = '1000';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            document.body.appendChild(buttonContainer);
        }

        // Remove existing "Show Revisit List" buttons to prevent duplicates
        const existingListButton = document.querySelector('#show-revisit-list-button');
        if (existingListButton) existingListButton.remove();

        const listButton = document.createElement('button');
        listButton.id = 'show-revisit-list-button'; // Add an ID for easier management
        listButton.innerText = 'Show Revisit List';
        listButton.style.padding = '10px';
        listButton.style.backgroundColor = '#3498db'; // Blue
        listButton.style.color = '#fff';
        listButton.style.border = 'none';
        listButton.style.borderRadius = '5px';
        listButton.style.cursor = 'pointer';

        listButton.addEventListener('click', () => {
            const revisitList = getRevisitList();
            if (revisitList.length === 0) {
                alert('No problems tagged as Revisit.');
                return;
            }

            // Create a modal overlay for better UI
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'revisit-modal-overlay';
            modalOverlay.style.position = 'fixed';
            modalOverlay.style.top = 0;
            modalOverlay.style.left = 0;
            modalOverlay.style.width = '100%';
            modalOverlay.style.height = '100%';
            modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modalOverlay.style.display = 'flex';
            modalOverlay.style.justifyContent = 'center';
            modalOverlay.style.alignItems = 'center';
            modalOverlay.style.zIndex = '10000'; // Ensure it's above other elements

            const modalContent = document.createElement('div');
            modalContent.style.backgroundColor = '#fff';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '5px';
            modalContent.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.25)';
            modalContent.style.maxHeight = '80%'; // Prevent overflow
            modalContent.style.overflowY = 'auto'; // Add scrolling if content exceeds height

            // Generate the list of revisited problems
            const listHtml =
                  '<h2>Revisit List</h2><ul style="list-style-type: none; padding: 0;">' +
                  revisitList
            .map(
                (url) =>
                `<li style="margin-bottom: 10px;"><a href="${url}" style="text-decoration: none; color: #3498db;">${url}</a></li>`
            )
            .join('') +
                  '</ul>';

            modalContent.innerHTML = listHtml;

            // Add close button
            const closeModalButton = document.createElement('button');
            closeModalButton.innerText = 'Close';
            closeModalButton.style.marginTop = '10px';
            closeModalButton.style.padding = '10px';
            closeModalButton.style.backgroundColor = '#e74c3c';
            closeModalButton.style.color = '#fff';
            closeModalButton.style.border = 'none';
            closeModalButton.style.borderRadius = '5px';
            closeModalButton.style.cursor = 'pointer';

            closeModalButton.addEventListener('click', () => {
                document.body.removeChild(modalOverlay);
            });

            // Append everything to the modal content
            modalContent.appendChild(closeModalButton);

            // Append content to overlay and overlay to body
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // Make links open in the same tab
            const links = modalContent.querySelectorAll('a');
            links.forEach((link) => {
                link.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default navigation behavior
                    window.location.href = link.href; // Navigate to the link in the same tab
                });
            });
        });


        buttonContainer.appendChild(listButton);
    }

    // Detect URL changes and reinitialize buttons
    let lastUrl = location.href;
    const observerConfig = { subtree: true, childList: true };

    const observerCallback = () => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            addRevisitButton(); // Reinitialize "Tag/Untag as Revisit" button
            addRevisitListButton(); // Reinitialize "Show Revisit List" button
        }
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, observerConfig);

    // Initial setup when the page loads
    window.addEventListener('load', () => {
        addRevisitButton();
        addRevisitListButton();
    });
})();
