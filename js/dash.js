var Dashboard = {
	init: function(options, elem) {

		// объединяем входные параметры с дефолтными
		this.options = $.extend({},this.options,options);

		// Сохраняем указатели на элементы
		this.elem = elem;
		this.$elem = $(elem);

		// реализуем базовую структуру DOM
		this._build();

		// возвращаем this для более простого обращения к объекту
		//console.log(this);
		return this;
	},

	options: {
	},

	_build: function(){

		this.time = new Object;
		this.time.start = Date.now();

		this.tacho = new Object;
		this.tacho.angle = 0;

		//Нулевой массив температур
		paper.install(window);
		
		paper.setup('dash');
		temp_plot = new Path({
			strokeColor: 'red',
			strokeWidth: 5,
			strokeCap: 'round',
		});
		for(var i = 0; i <= 30; i++){
			temp_plot.add(new Point(951 + i*5 + 10, 30 + 150 + 10));}
		this.temp = new Array;
		for (var i = 0; i <= 30; i++){
			this.temp[i] = 0;
		}

		//paper.setup('tacho');

		tacho = new Path({
			strokeWidth: 5,
			fillColor: 'red',
		})

		tacho.add(new Point(0,5));
		tacho.add(new Point(125,0));
		tacho.add(new Point(125,25));
		tacho.add(new Point(0,20));

		x0 = 592;
		y0 = 670;

		tacho.translate(new Point(x0 - 519, y0 - 25/2));
		

		view.onFrame = function(event) {
			dash.refreshTime();
			
			//dash.setTacho();
		}


	},

	//Запись времени для синхронизации реалтаймов
	refreshTime: function(){
		this.time.now = Date.now();
		this.$elem.find('#timestamp').text(this.time.now - this.time.start);
	},

	//Обновление графика температур
	renderTemp: function(){
		var points = dash.temp;
		for(var i = 0; i < temp_plot.segments.length; i++){
			if (points[i] > 120){points[i] = 120}
			if (points[i] < 70){points[i] = 70}
			temp_plot.segments[i].point.y = 30 + 150 + 10 - (points[i] - 70) / 50 * 150;
		}
		temp_plot.smooth();
	},

	//Обновление показаний скорости
	setSpeed: function(speed){
		if(!!speed){
			this.$elem.find('#speed').text(parseInt(speed));
		} else {
			this.$elem.find('#speed').text('---');
		}
		
	},

	sensorTacho: function(ms){
		rpm = Math.round(60000000 / ms);
		//console.log(rpm);
		this.setTacho(rpm);
	},

	setTacho: function(rpm){
		if (isNaN(rpm)){
			rpm = 0;
		}
		var angle = rpm / 10000 * 180;
		delta = this.tacho.angle + angle;
		tacho.rotate(delta, new Point(x0, y0));
		this.tacho.angle = this.tacho.angle - delta;
		this.$elem.find('#rpm').text(rpm);
	},


	//Получение данных с датчика температур (градусы Цельсия)
	sensorTemp: function(temperature){

		if (Date.now() >= last_time + 10000){


			// Смещаем массив температур на 1 влево, добавляя в конец новое значение
			$('#input_3').text(temperature);
			$('#temp_text').text(temperature);

			for (var i = 0; i < this.temp.length - 1; i++) {
				this.temp[i] = this.temp[i + 1];
			};
			this.temp[this.temp.length - 1] = temperature;
			

			
			if(temp > 100){
				$('#temp_text').addClass('overheat');
			} else {
				$('#temp_text').removeClass('overheat')
			}
			last_time = Date.now();
			dash.renderTemp();
			//renderTemp(this.temp);
			//console.log(this.temp);
		}

	},
}

// проверим наличие метода Object.create создадим, если отсутствует
if (typeof Object.create!=='function'){
	Object.create = function(o){
		function F(){}
		F.prototype = o;
		return new F();
	};
};

// создание плагина на основе описанного объекта
$.plugin = function(name, object) {
	$.fn[name] = function(options) {
		return this.each(function(){
			if (!$.data(this, name)){
				$.data(this, name, Object.create(object).init(options, this));
			}
		});
	};
};