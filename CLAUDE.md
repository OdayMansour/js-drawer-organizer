# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Run Commands
- Run the app locally: `python3 -m http.server`
- Open in browser: http://localhost:8000

## Code Style Guidelines
- **Modules**: Use ES6 module syntax with explicit `.js` extensions in imports
- **Formatting**: 4-space indentation, single quotes, semicolons required
- **Naming**: PascalCase for classes, camelCase for functions/variables
- **Architecture**: Class-based design with clear separation of concerns
- **Error Handling**: Use console.error for errors, return null/false on failure
- **Comments**: Use line comments for explanations, limited JSDoc for complex methods
- **External Libraries**: Paper.js is used for canvas rendering
- **Approach**: Binary Space Partitioning (BSP) is used for spatial organization

## File Organization
- `src/`: Contains all JavaScript modules
- `index.html`: Main entry point
- No build step or dependencies to install