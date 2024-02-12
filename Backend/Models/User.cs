using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Backend.Models
{
    // USER MODEL DEFINITION
    public class User
    {
        // USER IDENTIFIER
        public int UserId { get; set; }

        // USERNAME FIELD
        [Column(TypeName = "varchar(255)")]
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; } = string.Empty;

        // EMAIL FIELD
        [Column(TypeName = "varchar(255)")]
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "The email format is invalid.")]
        public string? Email { get; set; }

        // PASSWORD HASH FIELD
        public required byte[] PasswordHash { get; set; }

        // PASSWORD SALT FIED
        public required byte[] PasswordSalt { get; set; }

        // ACCOUNT CREATION TIMESTAMP
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // LAST ACCOUNT UPDATE TIMESTAMP
        public DateTime? UpdatedAt { get; set; }

        // LAST LOGIN TIMESTAMP
        public DateTime? LastLogin { get; set; }

        // COLLECTION OF USER NOTIFICATIONS
        public ICollection<Notification>? Notifications { get; set; }

        // COLLECTION OF USER CALENDARS
        public ICollection<Calendar>? Calendars { get; set; }
    }
}
