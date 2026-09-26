# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](vite-plugin-react/packages/plugin-react at main · vitejs/vite-plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](vite-plugin-react/packages/plugin-react-swc at main · vitejs/vite-plugin-react) uses [SWC](Rust-based platform for the Web - SWC)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](Installation – React).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](vite/packages/create-vite/template-react-ts at main · vitejs/vite) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.