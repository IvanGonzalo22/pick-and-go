using System;
using System.ComponentModel.DataAnnotations;

namespace PickAndGo.Api.Features.Auth.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; }

        [Required, MaxLength(100)]
        public string LastName { get; set; }

        [Required, MaxLength(255)]
        public string Email { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] Salt { get; set; }

        [Required, MaxLength(50)]
        public string Role { get; set; }  // 'Client','Employee','SuperAdmin'

        public DateTime CreatedAt { get; set; }
    }
}
