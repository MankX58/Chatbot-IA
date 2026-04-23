export default function Footer() {
    return (
        <footer className="border-t border-t-neutral-200 bg-white px-4 py-4 text-center text-[11px] tracking-[0.01em] text-neutral-400 sm:text-xs">
            © {new Date().getFullYear()} Universidad de Medellín · Centro de Soporte Tecnológico
        </footer>
    );
}
