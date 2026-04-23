export default function Footer() {
    return (
        <footer className="border-t border-t-neutral-200 bg-white px-4 py-3 text-center text-xs tracking-[0.01em] text-neutral-400">
            © {new Date().getFullYear()} Universidad de Medellín · Centro de Soporte Tecnológico
        </footer>
    );
}
