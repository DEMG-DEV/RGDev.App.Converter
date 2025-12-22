/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./renderer.js"],
    theme: {
        extend: {
            colors: {
                'dark-bg': '#121212',
                'dark-card': '#1E1E1E',
                'accent': '#3B82F6',
                'accent-hover': '#2563EB',
                'success': '#10B981',
                'warning': '#F59E0B',
                'error': '#EF4444'
            }
        },
    },
    plugins: [],
}
