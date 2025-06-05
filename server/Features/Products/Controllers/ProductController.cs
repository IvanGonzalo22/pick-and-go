// server/Features/Products/Controllers/ProductsController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;  // <-- Añadir
using server.Features.Products.DTOs;
using server.Features.Products.Services;

namespace server.Features.Products.Controllers
{
    [ApiController]
    [Route("products")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _svc;
        public ProductsController(ProductService svc) => _svc = svc;

        // GET /products[?category=xyz]
        [HttpGet]
        public Task<List<ProductDto>> List([FromQuery] string? category) =>
            _svc.GetAllAsync(category);

        // GET /products/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var dto = await _svc.GetByIdAsync(id);
            return dto == null ? NotFound() : Ok(dto);
        }

        // POST /products
        [HttpPost, Authorize(Roles="Employee,SuperAdmin")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var created = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        // PUT /products/{id}
        [HttpPut("{id:guid}"), Authorize(Roles="Employee,SuperAdmin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
        {
            if (id != dto.Id) return BadRequest();
            var updated = await _svc.UpdateAsync(dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        // DELETE /products/{id}
        [HttpDelete("{id:guid}"), Authorize(Roles="Employee,SuperAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _svc.DeleteAsync(id);
                return ok ? NoContent() : NotFound();
            }
            catch (DbUpdateException)
            {
                // Si el producto está referenciado (en carrito, etc.) EF lanza DbUpdateException.
                return BadRequest(new { Error = "No se puede eliminar: el producto está en uso." });
            }
        }
    }
}
