using System;
using System.ComponentModel.DataAnnotations;

namespace server.Features.Auth.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(100)]
        public string FirstName   { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LastName    { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string Email       { get; set; } = string.Empty;

        [Required]
        public byte[] PasswordHash{ get; set; } = Array.Empty<byte>();

        [Required]
        public byte[] Salt        { get; set; } = Array.Empty<byte>();

        [Required, MaxLength(50)]
        public string Role        { get; set; } = string.Empty; // 'Client','Employee','SuperAdmin'

        public DateTime CreatedAt { get; set; }

        // --- Nuevas columnas para reseteo de contraseña ---
        public Guid?   PasswordResetCode    { get; set; }
        public DateTime? PasswordResetExpires{ get; set; }

        // Fecha en que realmente cambió la contraseña (solo al resetear)
        public DateTime? PasswordLastChanged { get; set; }
    }
}
