namespace server.Features.Auth.DTOs
{
    public class RegisterClientDto
    {
        public string FirstName  { get; set; } = null!;
        public string LastName   { get; set; } = null!;
        public string Email      { get; set; } = null!;
        public string Password   { get; set; } = null!;
    }

    // Mismo payload, distinto endpoint y rol
    public class RegisterEmployeeDto : RegisterClientDto { }

    public class LoginDto
    {
        public string Email      { get; set; } = null!;
        public string Password   { get; set; } = null!;
    }

    public class AuthResponseDto
    {
        public Guid   Id         { get; set; }
        public string FirstName  { get; set; } = null!;
        public string LastName   { get; set; } = null!;
        public string Email      { get; set; } = null!;
        public string Role       { get; set; } = null!;
    }
}