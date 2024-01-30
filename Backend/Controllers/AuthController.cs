using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Dtos;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Models;

namespace Backend.Controllers
{
    // CONTROLLER FOR AUTHENTICATION PROCESSES (REGISTER, LOGIN)
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // DEPENDENCY INJECTION FOR AUTHENTICATION SERVICE AND AUTOMAPPER
        private readonly IAuthService _authService;
        private readonly IMapper _mapper;

        // CONSTRUCTOR INITIALIZING DEPENDENCIES
        public AuthController(IAuthService authService, IMapper mapper)
        {
            _authService = authService;
            _mapper = mapper;
        }

        // USER REGISTRATION (POST)
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegistrationDto registrationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userToCreate = _mapper.Map<User>(registrationDto);

            var createdUser = await _authService.Register(userToCreate, registrationDto.Password);
            if (createdUser == null)
                return BadRequest("User could not be created");

            var userToReturn = _mapper.Map<UserDto>(createdUser);
            return CreatedAtRoute("GetUserById", new { id = userToReturn.UserId }, userToReturn);
        }

        // USER LOGIN (POST)
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            var userFromService = await _authService.Login(loginDto.Username, loginDto.Password);
            if (userFromService == null)
                return Unauthorized("Invalid username or password");

            var token = _authService.GenerateJwtToken(userFromService);
            return Ok(new { token = token });
        }

        // USER LOGOUT (POST) | Will be managed on client side, because JWT token is stored in client (for example, in browser's local storage) and not on server.
        // However, if implementing a blacklist of tokens on server is really necessary to control disconnection on server side, it will always be possible to add conditions.
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout successful" });
        }

        // REFRESH JWT TOKEN (POST)
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(UserLoginDto loginDto)
        {
            try
            {
                var userFromService = await _authService.Login(loginDto.Username, loginDto.Password);
                var token = _authService.RefreshJwtToken(userFromService);
                return Ok(new { token = token });
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
