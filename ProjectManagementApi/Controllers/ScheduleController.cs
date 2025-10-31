using Microsoft.AspNetCore.Mvc;
using ProjectManager.Models;
using ProjectManager.Services;

namespace ProjectManager.Controllers
{
    [ApiController]
    [Route("api/v1/projects/{projectId}")]
    public class ScheduleController : ControllerBase
    {
        private readonly ISchedulerService _schedulerService;

        public ScheduleController(ISchedulerService schedulerService)
        {
            _schedulerService = schedulerService;
        }

        [HttpPost("schedule")]
        public ActionResult<ScheduleResponse> GenerateSchedule(
            [FromRoute] string projectId,
            [FromBody] TaskScheduleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = _schedulerService.GenerateSchedule(request.Tasks);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while generating the schedule." });
            }
        }
    }
}