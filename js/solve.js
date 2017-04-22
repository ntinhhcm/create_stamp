jQuery(document).ready(function($) {

		var headings = [];
		var $template_name = '';

		// Load template combobox
		$.each(config.template, function (key, value) {
			$('<option value=' + key + '>' + value.name + '</option>').appendTo('select#box_template');
		});

		// Hide option box
		$('#option_box').hide();

		$('input.box_print').click(function(event) {
			$content = $('#export-content').get(0).innerHTML;
			$window_print = window.open('', '_blank', '');
			$window_print.document.write('<html><head><title>' + $template_name + '</title>');
			$window_print.document.write('<link rel="stylesheet" type="text/css" href="template/css/' + $template_name + '.css"><style>');
			$window_print.document.write('div.box_render{width: 300px;height: 100px;border-color: rgb(0,0,0);border-style: solid;border-width: thin;margin: 5px 5px;float: left;}div.box_render .box_render_inside{width: 275px;height: 75px;border-color: rgb(0,0,0);border-style: solid;border-width: thin;margin: 0 auto;top: 10.5px;position: relative;}div.box_render .box_render_inside div {text-align: center;padding: 5px;}div.box_render .box_render_inside .main_name{font-weight: bold;text-align: center;font-size:15pt;}div.box_render .box_render_inside .position_name{font-size:14pt;}</style></head>');
			$window_print.document.write('<body>'+ $content + '</body></html>');
			$window_print.print();
			$window_print.document.close();
		});

		$('#filter_data').click(function($event) {
			if ($('input[name=box_file]').get(0).files.length <= 0) {
				return;
			}
			$checkedItem = $('#option_box').find('input[type=checkbox]:checked');
			if ($checkedItem.length <= 0) {
				return;
			}
			$filter_column = [];
			for (var i = 0; i < $checkedItem.length; i++) {
				$filter_column.push($checkedItem[i].value);
			}
			$src = URL.createObjectURL($('input[name=box_file]').get(0).files[0]);
			loadFileCSV($src, $filter_column, true);
		});

		$('input[name=box_file]').change(function($event){
			$src = URL.createObjectURL($('input[name=box_file]').get(0).files[0]);
			loadFileCSV($src);
		});

		$('#box_template').change(function($event){
			$('#view_temp').html('');
			$template_name = this.value;
			if ($template_name.length <= 0) {
				return;
			}
			// Remove tag is serviving that need change value
			$('#render_template').remove();
			$('link[href*=\'template/css/' + $template_name + '\']').remove();

			$('<link rel="stylesheet" type="text/css" href="template/css/' + $template_name + '.css">').appendTo('head');
			$('<div id="render_template"><div>').appendTo('body');
			$('#render_template').load('template/' + $template_name + '.html');
			$('#view_temp').hide();
			setTimeout(function() {
				if ($('#template').length == 0) {
					return;
				}
				var $template = $('#template');
				var $list_var = $template.attr('var_render').split('#');
				var $demo_data =config.template[$template_name].demo_data;

				$render = _.template($template.html());
				$result = $render($demo_data);
				$('#view_temp').append($result);
			}, 100);
			$('#view_temp').fadeIn();
			$('#option_box').fadeIn();
		});

		function loadFileCSV($src, $argument, $flag){
			$.ajax({
				type: "GET",
				url: $src,
				dataType: "text",
				success: function($data) {
					if (!$flag) {
						loadFilter($data);
					} else {
						if ($template_name.length <= 0 || $('#template').length == 0) {
							return;
						}
						processData($data, $argument);
					}
				}
			});
		}

		function processData($data, $argument) {
			var allTextLines = $data.split(/\r\n|\n/);
			var length = allTextLines.length;
			var lines = [];

			for (i = 0; i < length - 1; i++) {
				lines[i] = allTextLines[i].split(',');
			}

			var template = $('#template');
			var list_var = template.attr('var_render').split('#');
			$('#export-content').html('');
			for (i = 1; i < length - 1; i++) {
				var $render = _.template(template.html());
				var render_data = [];
				for (j = 0; j < list_var.length; j++) {
					render_data[list_var[j]] = lines[i][$argument[j]];
				}
				var $result = $render(render_data);
				$('#export-content').append($result);
			}
		}

		function loadFilter($data) {
			var allTextLines = $data.split(/\r\n|\n/);
			var length = allTextLines.length;
			var lines = [];

			for (i = 0; i < length - 1; i++) {
				lines[i] = allTextLines[i].split(',');
			}

			var headings = lines[0];
			var filter = $("#option_box fieldset #filter_data").parent();
			$template = $('#filter_item').html();
			$('#option_box').find('.filter').remove();
			for (var j = 0; j < headings.length; j++) {
				$render = _.template($template);
				$result = $render({a_order: j, a_fill_name: headings[j]});
				$(filter).before($result);
			}
		}
});