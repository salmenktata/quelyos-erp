/** @odoo-module **/

import { registry } from "@web/core/registry";
import { browser } from "@web/core/browser/browser";

// =============================================================================
// Title Service Override - Replace "Odoo" with "Quelyos"
// =============================================================================

const quelyosDebrandService = {
    dependencies: [],
    start() {
        // Override document title
        const originalTitle = document.title;
        if (originalTitle.includes('Odoo')) {
            document.title = originalTitle.replace(/Odoo/gi, 'Quelyos');
        }

        // Observe title changes
        const titleObserver = new MutationObserver(() => {
            if (document.title.includes('Odoo')) {
                document.title = document.title.replace(/Odoo/gi, 'Quelyos');
            }
        });

        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleObserver.observe(titleElement, { childList: true, characterData: true, subtree: true });
        }

        // Replace text content in the DOM
        this._replaceOdooReferences();

        // Observe DOM changes for dynamic content
        const bodyObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    this._replaceOdooReferences();
                }
            });
        });

        bodyObserver.observe(document.body, { childList: true, subtree: true });

        return {
            replaceReferences: () => this._replaceOdooReferences(),
        };
    },

    _replaceOdooReferences() {
        // Text replacements mapping
        const replacements = [
            { from: /OdooBot/gi, to: 'QuelyosBot' },
            { from: /Odoo\.com/gi, to: 'Quelyos' },
            { from: /Powered by Odoo/gi, to: '' },
            { from: /About Odoo/gi, to: 'À propos' },
            { from: /Odoo Documentation/gi, to: 'Documentation' },
            { from: /Odoo Server Error/gi, to: 'Erreur Serveur' },
            { from: /Log in with Odoo\.com/gi, to: '' },
            { from: /My Odoo\.com account/gi, to: '' },
        ];

        // Elements to search for text replacement
        const selectors = [
            '.o_menu_brand',
            '.o_user_menu a',
            '.o_notification_content',
            '.o_dialog_warning',
            '.o_form_label',
            '.o_field_widget',
            'h1, h2, h3, h4, h5, h6',
            'p',
            'span',
            'a',
            'button',
            'label',
            '.modal-title',
            '.modal-body',
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                    let text = el.textContent;
                    let changed = false;
                    replacements.forEach(({ from, to }) => {
                        if (from.test(text)) {
                            text = text.replace(from, to);
                            changed = true;
                        }
                    });
                    if (changed) {
                        el.textContent = text;
                    }
                }
            });
        });

        // Hide specific Odoo-branded elements
        const hideSelectors = [
            '[href*="odoo.com"]',
            '.o_odoo_logo',
            '.o_footer_poweredby',
        ];

        hideSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
            });
        });
    }
};

registry.category("services").add("quelyos_debrand", quelyosDebrandService);


// =============================================================================
// User Menu Customization - Remove Odoo.com links
// =============================================================================

import { patch } from "@web/core/utils/patch";
import { UserMenu } from "@web/webclient/user_menu/user_menu";

patch(UserMenu.prototype, {
    getElements() {
        const elements = super.getElements(...arguments);
        // Filter out Odoo.com related menu items
        return elements.filter(item => {
            const label = item.label || '';
            return !label.toLowerCase().includes('odoo.com') &&
                   !label.toLowerCase().includes('my odoo') &&
                   !label.toLowerCase().includes('odoo account');
        });
    }
});
