namespace server.Infrastructure.Configuration
{
    public class SmtpSettings
    {
        // Dirección o hostname del servidor SMTP (p. ej. smtp.gmail.com)
        public string Host { get; set; } = string.Empty;

        // Puerto que usa el servidor SMTP (587 para STARTTLS, 465 para SSL)
        public int Port { get; set; }

        // Usuario con el que te autenticas en el servidor SMTP
        public string User { get; set; } = string.Empty;

        // Contraseña para ese usuario SMTP
        public string Password { get; set; } = string.Empty;

        // Opcional: si quieres usar SSL/TLS
        public bool UseSsl { get; set; } = true;

        public string FrontendUrl  { get; set; } = string.Empty;
    }
}
