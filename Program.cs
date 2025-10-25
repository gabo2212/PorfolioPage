using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Serve index.html and static assets directly from the project root.
var fileProvider = new PhysicalFileProvider(app.Environment.ContentRootPath);

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = fileProvider,
    DefaultFileNames = new List<string> { "index.html" }
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider
});

// Fallback any unknown route to index.html (useful if you add more pages later)
app.MapFallback(async context =>
{
    var file = fileProvider.GetFileInfo("index.html");
    if (file.Exists)
    {
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(file);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
    }
});

app.Run();

