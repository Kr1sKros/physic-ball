using Microsoft.AspNetCore.Mvc;
using physics_assignment.Models;

namespace physics_assignment.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Create a simulation model with default values
            var model = new SimulationModel
            {
                MassA = 5.0,
                MassB = 1.0,
                InitialVelocityA = 10.0,
                InitialVelocityB = 0.0
            };

            return View(model);
        }

        public IActionResult Privacy()
        {
            return View();
        }
    }
}
