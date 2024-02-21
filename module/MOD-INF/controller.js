/**
 * controller.js
 *
 * Restart OpenRefine after making changes to this file, no need to recompile the extension or OpenRefine.
 */

var html = "text/html";
var encoding = "UTF-8";
var ClientSideResourceManager = Packages.com.google.refine.ClientSideResourceManager;

/**
 * Register extension commands.
 *
 * Each Roundup command is accessible via /command/roundup/<endpoint>.
 */
function registerCommands() {
    Packages.java.lang.System.out.println("Registering Roundup commands");

    var refineServlet = Packages.com.google.refine.RefineServlet;
    var commands = Packages.com.google.refine.roundup.commands;

    // Register commands
    [
        {endpoint: 'insert-rows', className: new commands.row.InsertRowsCommand()},
        {endpoint: 'aggregate-rows', className: new commands.row.AggregateRowsCommand()},
        {endpoint: 'copy-project', className: new commands.project.CopyProjectCommand()},
        {endpoint: 'scratch', className: new commands.Scratch()},
        // {endpoint: 'set-metadata', className: new commands.SetMetadata()},
    ].forEach(function(cmd) {
        Packages.java.lang.System.out.println("\t/commands/roundup/" + cmd.endpoint);
        refineServlet.registerCommand(module, cmd.endpoint, cmd.className);
    });
}

/*
 * Function invoked to initialize the extension.
 */
function init() {
    Packages.java.lang.System.err.println("Initializing Roundup extension");
    Packages.java.lang.System.err.println(module.getMountPoint());

    registerCommands();

    // ClientSideResourceManager.addPaths(
    //     "index/scripts", // Find this script at /index-bundle.js
    //     module,
    //     [
    //         "scripts/roundup.js"
    //     ]
    // );
    //
    // ClientSideResourceManager.addPaths(
    //     "index/styles", // Find these stylesheets at /extension/roundup/*
    //     module,
    //     [
    //         "styles/roundup.less"
    //     ]
    // );
}

/*
 * Function invoked to handle each request in a custom way.
 */
function process(path, request, response) {
  // Analyze path and handle this request yourself.

  if (path == "/" || path == "") {
    var context = {};
    // here's how to pass things into the .vt templates
    context.someList = ["Superior","Michigan","Huron","Erie","Ontario"];
    context.someString = "foo";
    // context.someInt = Packages.com.google.refine.roundup.SampleUtil.stringArrayLength(context.someList);
    // context.projects = Packages.com.google.refine.ProjectManager;

    send(request, response, "index.vt", context);
  }
}

function send(request, response, template, context) {
  butterfly.sendTextFromTemplate(request, response, context, template, encoding, html);
}
