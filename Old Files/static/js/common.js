

/*
*/
function loadTemplate(args) {
    return $.ajax({
        url: `templates/${args.template}.html`,
        dataType: 'text',
        success: function(source) {

            // generate template
            const template = Handlebars.compile(source);
            const context = args.context ? args.context : {};
            const html  = template(context);

            // get target element for template
            let $target = $(`#${args.target}`);

            // choose method of injection
            switch(args.injection) {
                case 'html':
                    $target.html(html);
                    break;
                case 'append':
                    $target.append(html);
                    break;
                case 'prepend':
                    $target.prepend(html);
                    break;
                default:
                    $target.html(html);
            }

            // if no js file then dont load
            if (!args.noJsFile) {
                $.getScript(`js/${args.template}.js`);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.error(`${args.template} HandlebarsTemplate error occurred: ${textStatus}: ${errorThrown}`);
            return;
        }
    });
}



Handlebars.registerHelper('isSelected', function(inputVal, userSetting) {
    return inputVal === userSetting ? 'selected' : '';
});


function loadnavMenu(){
    loadTemplate({
        template: 'navMenu',
        target: 'navMenu',
        context: {
            port: userSettings.port || 0,
            emberUrl: /localhost/.test(userSettings.ember) ? userSettings.ember : `${userSettings.ember}:${userSettings.port}`,
            emberLocal: /localhost/.test(userSettings.ember) ? '#/' : ''
        }
    });
}

function loadUserSettings(){
    loadTemplate({
        template: 'userSettings',
        target: 'userSettings',
        context: {
            port: userSettings.port,
            emberUrl: userSettings.ember,
            attuid: userSettings.attuid,
            password: userSettings.password
        }
    });
}