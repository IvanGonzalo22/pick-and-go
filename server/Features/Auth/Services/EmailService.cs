using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using server.Infrastructure.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace server.Features.Auth.Services
{
    public class EmailService
    {
        private readonly SmtpSettings _smtp;

        // IOptions<SmtpSettings> inyecta la configuración desde appsettings.json
        public EmailService(IOptions<SmtpSettings> smtpOptions)
        {
            _smtp = smtpOptions.Value;
        }

        public async Task SendResetPasswordEmail(string toEmail, Guid code)
        {
            // Construir mensaje MIME
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_smtp.User));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = "Restablece tu contraseña en PickAndGo!";

           var link = $"{_smtp.FrontendUrl}/reset-password?code={code}";
            message.Body = new TextPart("html")
            {
                Text = $@"
                    <p>Hola,</p>
                    <p>Has solicitado restablecer tu contraseña. Para ello, haz clic en el siguiente enlace:</p>
                    <p><a href=""{link}"">Restablecer contraseña</a></p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>"
            };

            using var client = new SmtpClient();

            // Conectar al servidor SMTP, con o sin SSL según configuración
            if (_smtp.UseSsl)
                await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.StartTls);
            else
                await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.None);

            // Autenticarse y enviar
            await client.AuthenticateAsync(_smtp.User, _smtp.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
