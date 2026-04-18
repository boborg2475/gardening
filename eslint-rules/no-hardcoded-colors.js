/**
 * ESLint rule: no-hardcoded-colors
 *
 * Flags hardcoded hex color values (#RGB, #RRGGBB, #RRGGBBAA) and rgb()/rgba()
 * calls in source files. Colors should come from the design system tokens
 * (app.css @theme) or canvas-theme.ts constants.
 *
 * Allowed:
 * - #000, #000000 (black)
 * - #fff, #ffffff (white)
 * - Files in the allowlist (app.css, canvas-theme.ts, logger.ts)
 */

const ALLOWED_HEX = new Set(['#000', '#000000', '#fff', '#ffffff', '#FFF', '#FFFFFF']);

const ALLOWLISTED_FILES = ['app.css', 'canvas-theme.ts', 'logger.ts'];

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_PATTERN = /rgba?\(\s*\d+/g;

function isAllowlistedFile(filename) {
	return ALLOWLISTED_FILES.some((f) => filename.endsWith(f));
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow hardcoded color values — use design system tokens instead'
		},
		messages: {
			noHardcodedHex:
				'Hardcoded color "{{color}}" — use a design system token or canvas-theme constant instead.',
			noHardcodedRgb:
				'Hardcoded rgb/rgba color — use a design system token or canvas-theme constant instead.'
		},
		schema: []
	},
	create(context) {
		const filename = context.filename || context.getFilename();
		if (isAllowlistedFile(filename)) return {};

		function checkString(node, value) {
			if (typeof value !== 'string') return;

			// Check hex colors
			let match;
			HEX_PATTERN.lastIndex = 0;
			while ((match = HEX_PATTERN.exec(value)) !== null) {
				const color = match[0];
				if (ALLOWED_HEX.has(color.toLowerCase())) continue;
				context.report({ node, messageId: 'noHardcodedHex', data: { color } });
			}

			// Check rgb/rgba
			RGB_PATTERN.lastIndex = 0;
			if (RGB_PATTERN.test(value)) {
				context.report({ node, messageId: 'noHardcodedRgb' });
			}
		}

		return {
			Literal(node) {
				checkString(node, node.value);
			},
			TemplateLiteral(node) {
				for (const quasi of node.quasis) {
					checkString(node, quasi.value.raw);
				}
			}
		};
	}
};
