# Rule: Tester Mode

- When the user mentions "tester mode" or asks to simulate a fresh device setup, the AI must temporarily ignore/forget any auto-ADB pairing shortcuts or auto-connections.
- It must instruct the system/plugin to behave as a brand-new device, prompting the user to go through the full interactive remote pairing and ADB pairing wizards from scratch.
- If editing configuration files or checking states, the AI must clean or simulate empty certs and endpoints to force clean-slate testing flows.
