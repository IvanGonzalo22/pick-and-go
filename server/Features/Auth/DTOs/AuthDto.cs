namespace PickAndGo.Api.Features.Auth.DTOs
{
    public class RegisterClientDto
    {
        public string FirstName  { get; set; }
        public string LastName   { get; set; }
        public string Email      { get; set; }
        public string Password   { get; set; }
    }

    // Mismo payload, distinto endpoint y rol
    public class RegisterEmployeeDto : RegisterClientDto { }

    public class LoginDto
    {
        public string Email      { get; set; }
        public string Password   { get; set; }
    }

    public class AuthResponseDto
    {
        public Guid   Id         { get; set; }
        public string FirstName  { get; set; }
        public string LastName   { get; set; }
        public string Email      { get; set; }
        public string Role       { get; set; }
    }
}
