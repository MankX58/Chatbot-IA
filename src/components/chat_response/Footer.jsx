import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            © {new Date().getFullYear()} Universidad de Medellín · Centro de Soporte Tecnológico
        </footer>
    );
}
