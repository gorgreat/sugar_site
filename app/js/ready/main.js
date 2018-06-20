/**
 * Created with JetBrains PhpStorm.
 * User: Vitaly
 * Date: 06.06.13
 * Time: 20:22
 * To change this template use File | Settings | File Templates.
 */
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(typeof haystack[i] == 'object') {
            if(arrayCompare(haystack[i], needle)) return true;
        } else {
            if(haystack[i] == needle) return true;
        }
    }
    return false;
}
window.isset = function (v) {
    if (typeof(v) == 'object' && v == 'undefined') {
        return false;
    } else  if (arguments.length === 0) {
        return false;
    } else {
        var buff = arguments[0];
        for (var i = 0; i < arguments.length; i++){
            if (typeof(buff) === 'undefined' || buff === null) return false;
            buff = buff[arguments[i+1]];
        }
    }
    return true;
}

function myconf() {
    var cf = $.Deferred();
        $.ajax({
            type: 'POST',
            url: 'feedback/',
            dataType: 'json',
            data: 'act=cfg',
            success: function(answer) {
                cf.resolve(answer.configs);
            }
        });
    return cf;
}

var mcf = myconf();

mcf.done(function(conf) {

$(document).ready(function() {
(function() {
           var fb = $('.feedback');
           if(fb.length > 0) {
                fb.each(function(){
                    var form = $(this).closest('form'), name = form.attr('name');
                    //console.log(form);
                    if(isset(conf[name]) && isset(conf[name].cfg.antispamjs)) {
                      $(form).prepend('<input type="text" name="'+ conf[name].cfg.antispamjs +'" value="tesby" style="display:none;">');
                    }
                });
            }
  })();
});


/**
 * Отправка форм.
 *
 */

function feedback(vars) {
    var bt = $(vars.form).find('.feedback');
    var btc = bt.clone();
    var bvc = bt.val();
    var cfg = conf[vars.act].cfg;

    $.ajax({
        type: 'POST',
        url: 'feedback/',
        cache: false,
        dataType: 'json',
        data: 'act=' + vars.act + '&' + vars.data,
        beforeSend: function() {
            //$(bt).val('');
            $(bt).prop("disabled", true);
            $(bt).addClass('loading');
        },
        success: function(answer) {
            //console.log(cfg);
          if(isset(cfg.notify) && !/none/i.test(cfg.notify)) {

        if(/color/i.test(cfg.notify)) {
                 $(vars.form).find('input[type=text]:visible, textarea:visible, select:visible').css({'border': '1px solid #D7D5CF'}, 300);
                 if(isset(answer.errors)) {
                     $.each(answer.errors, function(k,val) {
                         var reg = /[a-z]/i;
                         if(reg.test(k)) {
                          var e = $(vars.form).find('[name='+ k +']');
                          if(e.length == 1) {
                           $(e).css({'border': '2px solid #425969'}, 100);
                          }
                        }
                     });
                 } if(isset(answer.infos)) {
                      var li='', $inf = $('<ul>', {id:'feedback-infolist'});
                       $.each(answer.infos, function(k,val) {
                          li += '<li>'+ val +'</li>';
                       });

                      $inf.html(li);

                      $.arcticmodal('close');

                      if(/modal/i.test(cfg.notify)) {
                          var m = $('<div class="box-modal" id="feedback-modal-box" />');
                          m.html($inf);
                          m.prepend('<div class="modal-close arcticmodal-close">X</div>');
                          $.arcticmodal({content: m});
                          $('.popup').hide();
                          $('.overlay').hide();
                      }
                       //bt.replaceWith($inf);

                     /* setInterval(function(){
                        //$('#feedback-inf-box').replaceWith(btc);
                        $('#feedback-modal-box').arcticmodal('close');
                      }, 4000);*/
                  }

            }
          }
            $(bt).prop("disabled", false);
            $(bt).removeClass('loading');
            //$(bt).val(bvc);

            if(isset(answer.ok) && answer.ok == 1) {
                $(vars.form)[0].reset();
            }
        }
    });

}

    $(document).on('mouseenter mouseover', '.feedback', function(){
        var form = $(this).closest('form'), name = form.attr('name');
        if(isset(conf[name]) && isset(conf[name].cfg.antispamjs)) {
            $('input[name='+ conf[name].cfg.antispamjs +']').val('');
        }
    });


/**
 * Обработчик кнопки форм.
 * Кнопка должна быть внутри тегов <form> c классом .feedback
 * будет отправлено любое кол-во полей, кроме файлов
 *
 */

$(document).on('click', '.feedback', function(){
   var form = $(this).closest('form'), name = form.attr('name'), obj = {};
       obj.form = form;
       obj.act = name;
       obj.data = $(form).serialize();

      feedback(obj);

    return false;
});

}); // done
/*

 arcticModal — jQuery plugin
 Version: 0.3
 Author: Sergey Predvoditelev (sergey.predvoditelev@gmail.com)
 Company: Arctic Laboratory (http://arcticlab.ru/)

 Docs & Examples: http://arcticlab.ru/arcticmodal/

 */
(function($) {


	var default_options = {

		type: 'html', // ajax или html
		content: '',
		url: '',
		ajax: {},
		ajax_request: null,

		closeOnEsc: true,
		closeOnOverlayClick: true,

		clone: false,

		overlay: {
			block: undefined,
			tpl: '<div class="arcticmodal-overlay"></div>',
			css: {
				backgroundColor: '#000',
				opacity: .6
			}
		},

		container: {
			block: undefined,
			tpl: '<div class="arcticmodal-container"><table class="arcticmodal-container_i"><tr><td class="arcticmodal-container_i2"></td></tr></table></div>'
		},

		wrap: undefined,
		body: undefined,

		errors: {
			tpl: '<div class="arcticmodal-error arcticmodal-close"></div>',
			autoclose_delay: 2000,
			ajax_unsuccessful_load: 'Error'
		},

		openEffect: {
			type: 'fade',
			speed: 400
		},
		closeEffect: {
			type: 'fade',
			speed: 400
		},

		beforeOpen: $.noop,
		afterOpen: $.noop,
		beforeClose: $.noop,
		afterClose: $.noop,
		afterLoading: $.noop,
		afterLoadingOnShow: $.noop,
		errorLoading: $.noop

	};


	var modalID = 0;
	var modals = $([]);


	var utils = {


		// Определяет произошло ли событие e вне блока block
		isEventOut: function(blocks, e) {
			var r = true;
			$(blocks).each(function() {
				if ($(e.target).get(0)==$(this).get(0)) r = false;
				if ($(e.target).closest('HTML', $(this).get(0)).length==0) r = false;
			});
			return r;
		}


	};


	var modal = {


		// Возвращает элемент, которым был вызван плагин
		getParentEl: function(el) {
			var r = $(el);
			if (r.data('arcticmodal')) return r;
			r = $(el).closest('.arcticmodal-container').data('arcticmodalParentEl');
			if (r) return r;
			return false;
		},


		// Переход
		transition: function(el, action, options, callback) {
			callback = callback==undefined ? $.noop : callback;
			switch (options.type) {
				case 'fade':
					action=='show' ? el.fadeIn(options.speed, callback) : el.fadeOut(options.speed, callback);
					break;
				case 'none':
					action=='show' ? el.show() : el.hide();
					callback();
					break;
			}
		},


		// Подготвка содержимого окна
		prepare_body: function(D, $this) {

			// Обработчик закрытия
			$('.arcticmodal-close', D.body).unbind('click.arcticmodal').bind('click.arcticmodal', function() {
				$this.arcticmodal('close');
				return false;
			});

		},


		// Инициализация элемента
		init_el: function($this, options) {
			var D = $this.data('arcticmodal');
			if (D) return;

			D = options;
			modalID++;
			D.modalID = modalID;

			// Overlay
			D.overlay.block = $(D.overlay.tpl);
			D.overlay.block.css(D.overlay.css);

			// Container
			D.container.block = $(D.container.tpl);

			// BODY
			D.body = $('.arcticmodal-container_i2', D.container.block);
			if (options.clone) {
				D.body.html($this.clone(true));
			} else {
				$this.before('<div id="arcticmodalReserve' + D.modalID + '" style="display: none" />');
				D.body.html($this);
			}

			// Подготовка содержимого
			modal.prepare_body(D, $this);

			// Закрытие при клике на overlay
			if (D.closeOnOverlayClick)
				D.overlay.block.add(D.container.block).click(function(e) {
					if (utils.isEventOut($('>*', D.body), e))
						$this.arcticmodal('close');
				});

			// Запомним настройки
			D.container.block.data('arcticmodalParentEl', $this);
			$this.data('arcticmodal', D);
			modals = $.merge(modals, $this);

			// Показать
			$.proxy(actions.show, $this)();
			if (D.type=='html') return $this;

			// Ajax-загрузка
			if (D.ajax.beforeSend!=undefined) {
				var fn_beforeSend = D.ajax.beforeSend;
				delete D.ajax.beforeSend;
			}
			if (D.ajax.success!=undefined) {
				var fn_success = D.ajax.success;
				delete D.ajax.success;
			}
			if (D.ajax.error!=undefined) {
				var fn_error = D.ajax.error;
				delete D.ajax.error;
			}
			var o = $.extend(true, {
				url: D.url,
				beforeSend: function() {
					if (fn_beforeSend==undefined) {
						D.body.html('<div class="arcticmodal-loading" />');
					} else {
						fn_beforeSend(D, $this);
					}
				},
				success: function(responce) {

					// Событие после загрузки до показа содержимого
					$this.trigger('afterLoading');
					D.afterLoading(D, $this, responce);

					if (fn_success==undefined) {
						D.body.html(responce);
					} else {
						fn_success(D, $this, responce);
					}
					modal.prepare_body(D, $this);

					// Событие после загрузки после отображения содержимого
					$this.trigger('afterLoadingOnShow');
					D.afterLoadingOnShow(D, $this, responce);

				},
				error: function() {

					// Событие при ошибке загрузки
					$this.trigger('errorLoading');
					D.errorLoading(D, $this);

					if (fn_error==undefined) {
						D.body.html(D.errors.tpl);
						$('.arcticmodal-error', D.body).html(D.errors.ajax_unsuccessful_load);
						$('.arcticmodal-close', D.body).click(function() {
							$this.arcticmodal('close');
							return false;
						});
						if (D.errors.autoclose_delay)
							setTimeout(function() {
								$this.arcticmodal('close');
							}, D.errors.autoclose_delay);
					} else {
						fn_error(D, $this);
					}
				}
			}, D.ajax);
			D.ajax_request = $.ajax(o);

			// Запомнить настройки
			$this.data('arcticmodal', D);

		},


		// Инициализация
		init: function(options) {
			options = $.extend(true, {}, default_options, options);
			if ($.isFunction(this)) {
				if (options==undefined) {
					$.error('jquery.arcticmodal: Uncorrect parameters');
					return;
				}
				if (options.type=='') {
					$.error('jquery.arcticmodal: Don\'t set parameter "type"');
					return;
				}
				switch (options.type) {
					case 'html':
						if (options.content=='') {
							$.error('jquery.arcticmodal: Don\'t set parameter "content"');
							return
						}
						var c = options.content;
						options.content = '';

						return modal.init_el($(c), options);
						break;
					case 'ajax':
						if (options.url=='') {
							$.error('jquery.arcticmodal: Don\'t set parameter "url"');
							return;
						}
						return modal.init_el($('<div />'), options);
						break;
				}
			} else {
				return this.each(function() {
					modal.init_el($(this), $.extend(true, {}, options));
				});
			}
		}


	};


	var actions = {


		// Показать
		show: function() {
			var $this = modal.getParentEl(this);
			if ($this===false) {
				$.error('jquery.arcticmodal: Uncorrect call');
				return;
			}
			var D = $this.data('arcticmodal');

			// Добавить overlay и container
			D.overlay.block.hide();
			D.container.block.hide();
			$('BODY').append(D.overlay.block);
			$('BODY').append(D.container.block);

			// Событие
			D.beforeOpen(D, $this);
			$this.trigger('beforeOpen');

			// Wrap
			if (D.wrap.css('overflow')!='hidden') {
				D.wrap.data('arcticmodalOverflow', D.wrap.css('overflow'));
				var w1 = D.wrap.outerWidth(true);
				D.wrap.css('overflow', 'hidden');
				var w2 = D.wrap.outerWidth(true);
				if (w2!=w1)
					D.wrap.css('marginRight', (w2 - w1) + 'px');
			}

			// Скрыть предыдущие оверлеи
			modals.not($this).each(function() {
				var d = $(this).data('arcticmodal');
				d.overlay.block.hide();
			});

			// Показать
			modal.transition(D.overlay.block, 'show', modals.length>1 ? {type: 'none'} : D.openEffect);
			modal.transition(D.container.block, 'show', modals.length>1 ? {type: 'none'} : D.openEffect, function() {
				D.afterOpen(D, $this);
				$this.trigger('afterOpen');
			});

			return $this;
		},


		// Закрыть
		close: function() {
			if ($.isFunction(this)) {
				modals.each(function() {
					$(this).arcticmodal('close');
				});
			} else {
				return this.each(function() {
					var $this = modal.getParentEl(this);
					if ($this===false) {
						$.error('jquery.arcticmodal: Uncorrect call');
						return;
					}
					var D = $this.data('arcticmodal');

					// Событие перед закрытием
					if (D.beforeClose(D, $this)===false) return;
					$this.trigger('beforeClose');

					// Показать предыдущие оверлеи
					modals.not($this).last().each(function() {
						var d = $(this).data('arcticmodal');
						d.overlay.block.show();
					});

					modal.transition(D.overlay.block, 'hide', modals.length>1 ? {type: 'none'} : D.closeEffect);
					modal.transition(D.container.block, 'hide', modals.length>1 ? {type: 'none'} : D.closeEffect, function() {

						// Событие после закрытия
						D.afterClose(D, $this);
						$this.trigger('afterClose');

						// Если не клонировали - вернём на место
						if (!D.clone)
							$('#arcticmodalReserve' + D.modalID).replaceWith(D.body.find('>*'));

						D.overlay.block.remove();
						D.container.block.remove();
						$this.data('arcticmodal', null);
						if (!$('.arcticmodal-container').length) {
							if (D.wrap.data('arcticmodalOverflow'))
								D.wrap.css('overflow', D.wrap.data('arcticmodalOverflow'));
							D.wrap.css('marginRight', 0);
						}

					});

					if (D.type=='ajax')
						D.ajax_request.abort();

					modals = modals.not($this);
				});
			}
		},


		// Установить опции по-умолчанию
		setDefault: function(options) {
			$.extend(true, default_options, options);
		}


	};


	$(function() {
		default_options.wrap = $((document.all && !document.querySelector) ? 'html' : 'body');
	});


	// Закрытие при нажатии Escape
	$(document).bind('keyup.arcticmodal', function(e) {
		var m = modals.last();
		if (!m.length) return;
		var D = m.data('arcticmodal');
		if (D.closeOnEsc && (e.keyCode===27))
			m.arcticmodal('close');
	});


	$.arcticmodal = $.fn.arcticmodal = function(method) {

		if (actions[method]) {
			return actions[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method==='object' || !method) {
			return modal.init.apply(this, arguments);
		} else {
			$.error('jquery.arcticmodal: Method ' + method + ' does not exist');
		}

	};


})(jQuery);
(function ($) {
  var $ie6 = (function () {
    return false === $.support.boxModel && $.support.objectAll && $support.leadingWhitespace;
  })();
  $.jGrowl = function (m, o) {
    if ($('#jGrowl').size() == 0)
      $('').appendTo('body');
    $('#jGrowl').jGrowl(m, o);
  };
  $.fn.jGrowl = function (m, o) {
    if ($.isFunction(this.each)) {
      var args = arguments;
      return this.each(function () {
        var self = this;
        if ($(this).data('jGrowl.instance') == undefined) {
          $(this).data('jGrowl.instance', $.extend(new $.fn.jGrowl(), {
            notifications: [],
            element: null,
            interval: null
          }));
          $(this).data('jGrowl.instance').startup(this);
        }
        if ($.isFunction($(this).data('jGrowl.instance')[m])) {
          $(this).data('jGrowl.instance')[m].apply($(this).data('jGrowl.instance'), $.makeArray(args).slice(1));
        } else {
          $(this).data('jGrowl.instance').create(m, o);
        }
      });
    };
  };
  $.jGrowl.defaults = $.fn.jGrowl.prototype.defaults;

})(jQuery);

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b,c=navigator.userAgent,d=/iphone/i.test(c),e=/chrome/i.test(c),f=/android/i.test(c);a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},autoclear:!0,dataName:"rawMaskFn",placeholder:"_"},a.fn.extend({caret:function(a,b){var c;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof a?(b="number"==typeof b?b:a,this.each(function(){this.setSelectionRange?this.setSelectionRange(a,b):this.createTextRange&&(c=this.createTextRange(),c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select())})):(this[0].setSelectionRange?(a=this[0].selectionStart,b=this[0].selectionEnd):document.selection&&document.selection.createRange&&(c=document.selection.createRange(),a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length),{begin:a,end:b})},unmask:function(){return this.trigger("unmask")},mask:function(c,g){var h,i,j,k,l,m,n,o;if(!c&&this.length>0){h=a(this[0]);var p=h.data(a.mask.dataName);return p?p():void 0}return g=a.extend({autoclear:a.mask.autoclear,placeholder:a.mask.placeholder,completed:null},g),i=a.mask.definitions,j=[],k=n=c.length,l=null,a.each(c.split(""),function(a,b){"?"==b?(n--,k=a):i[b]?(j.push(new RegExp(i[b])),null===l&&(l=j.length-1),k>a&&(m=j.length-1)):j.push(null)}),this.trigger("unmask").each(function(){function h(){if(g.completed){for(var a=l;m>=a;a++)if(j[a]&&C[a]===p(a))return;g.completed.call(B)}}function p(a){return g.placeholder.charAt(a<g.placeholder.length?a:0)}function q(a){for(;++a<n&&!j[a];);return a}function r(a){for(;--a>=0&&!j[a];);return a}function s(a,b){var c,d;if(!(0>a)){for(c=a,d=q(b);n>c;c++)if(j[c]){if(!(n>d&&j[c].test(C[d])))break;C[c]=C[d],C[d]=p(d),d=q(d)}z(),B.caret(Math.max(l,a))}}function t(a){var b,c,d,e;for(b=a,c=p(a);n>b;b++)if(j[b]){if(d=q(b),e=C[b],C[b]=c,!(n>d&&j[d].test(e)))break;c=e}}function u(){var a=B.val(),b=B.caret();if(o&&o.length&&o.length>a.length){for(A(!0);b.begin>0&&!j[b.begin-1];)b.begin--;if(0===b.begin)for(;b.begin<l&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}else{for(A(!0);b.begin<n&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}h()}function v(){A(),B.val()!=E&&B.change()}function w(a){if(!B.prop("readonly")){var b,c,e,f=a.which||a.keyCode;o=B.val(),8===f||46===f||d&&127===f?(b=B.caret(),c=b.begin,e=b.end,e-c===0&&(c=46!==f?r(c):e=q(c-1),e=46===f?q(e):e),y(c,e),s(c,e-1),a.preventDefault()):13===f?v.call(this,a):27===f&&(B.val(E),B.caret(0,A()),a.preventDefault())}}function x(b){if(!B.prop("readonly")){var c,d,e,g=b.which||b.keyCode,i=B.caret();if(!(b.ctrlKey||b.altKey||b.metaKey||32>g)&&g&&13!==g){if(i.end-i.begin!==0&&(y(i.begin,i.end),s(i.begin,i.end-1)),c=q(i.begin-1),n>c&&(d=String.fromCharCode(g),j[c].test(d))){if(t(c),C[c]=d,z(),e=q(c),f){var k=function(){a.proxy(a.fn.caret,B,e)()};setTimeout(k,0)}else B.caret(e);i.begin<=m&&h()}b.preventDefault()}}}function y(a,b){var c;for(c=a;b>c&&n>c;c++)j[c]&&(C[c]=p(c))}function z(){B.val(C.join(""))}function A(a){var b,c,d,e=B.val(),f=-1;for(b=0,d=0;n>b;b++)if(j[b]){for(C[b]=p(b);d++<e.length;)if(c=e.charAt(d-1),j[b].test(c)){C[b]=c,f=b;break}if(d>e.length){y(b+1,n);break}}else C[b]===e.charAt(d)&&d++,k>b&&(f=b);return a?z():k>f+1?g.autoclear||C.join("")===D?(B.val()&&B.val(""),y(0,n)):z():(z(),B.val(B.val().substring(0,f+1))),k?b:l}var B=a(this),C=a.map(c.split(""),function(a,b){return"?"!=a?i[a]?p(b):a:void 0}),D=C.join(""),E=B.val();B.data(a.mask.dataName,function(){return a.map(C,function(a,b){return j[b]&&a!=p(b)?a:null}).join("")}),B.one("unmask",function(){B.off(".mask").removeData(a.mask.dataName)}).on("focus.mask",function(){if(!B.prop("readonly")){clearTimeout(b);var a;E=B.val(),a=A(),b=setTimeout(function(){B.get(0)===document.activeElement&&(z(),a==c.replace("?","").length?B.caret(0,a):B.caret(a))},10)}}).on("blur.mask",v).on("keydown.mask",w).on("keypress.mask",x).on("input.mask paste.mask",function(){B.prop("readonly")||setTimeout(function(){var a=A(!0);B.caret(a),h()},0)}),e&&f&&B.off("input.mask").on("input.mask",u),A()})}})});
document.addEventListener("DOMContentLoaded", function (event) {
  let buttonToogle = document.querySelector('.page__header .toogle-btn'),
    buttonToogleFeatures = document.querySelector('.features .toogle-btn'),
    navItems = document.querySelector('.nav__items'),
    featuresItems = document.querySelector('.features__items'),
    serviseBtn = document.querySelectorAll('.servise___btn'),
    overlay = document.querySelector('.overlay'),
    popup = document.querySelector('.popup'),
    popupClose = document.querySelector('.popup__close');

  /*мобильное меню */
  buttonToogle.addEventListener('click', function () {
    navItems.classList.toggle('hidden');
    buttonToogle.classList.toggle('toogle-btn-open');
  });

  /*Преимущества */
  buttonToogleFeatures.addEventListener('click', function () {
    featuresItems.classList.toggle('hidden');
    buttonToogleFeatures.classList.toggle('toogle-btn-open');
  });

  //попап
  for (let i = 0; i < serviseBtn.length; i++) {
    serviseBtn[i].addEventListener('click', function () {
      overlay.style.display = 'block';
      popup.style.display = 'block';
    });
  }
  //закрытие попап
  function closePopup() {
    overlay.addEventListener('click', function () {
      popup.style.display = 'none';
      overlay.style.display = 'none';
    });
    popupClose.addEventListener('click', function () {
      popup.style.display = 'none';
      overlay.style.display = 'none';
    })
  };

  closePopup();
  
  
});

$(document).ready(function () {
  $(document).on('click', '.modal_btn', function () {
    $('#small-modal').arcticmodal();
  });
  $('input').attr('required', 'required')
});
$(function () {
  $(".input-phone").mask("8 (999) 999-99-99");
});

document.addEventListener("DOMContentLoaded", function (event) {
  function animate(draw, duration) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
      let timePassed = time - start;

      if (timePassed > duration) {
        timePassed = duration;
      }
      draw(timePassed);

      if (timePassed < duration) {
        requestAnimationFrame(animate);
      }
    })
  };

  let nav = document.getElementsByTagName('nav')[0];

  nav.addEventListener('click', function (event) {
    event.preventDefault();

    animate(function (timePassed) {
      let target = event.target;
      let section = document.getElementById(target.getAttribute('href').slice(1));
      window.scrollBy(0, section.getBoundingClientRect().top / 20 - 3);
    }, 2500);

  });
});

document.addEventListener("DOMContentLoaded", function (event) {
  let slideIndex = 1,
    slides = document.getElementsByClassName('review__item'),
    leftArrow = document.querySelector('.reviews__left-arrow'),
    rightArrow = document.querySelector('.reviews__right-arrow'),
    dots = document.querySelector('.reviews__controls'),
    dot = document.getElementsByClassName('control__item');

  showSlides(slideIndex);

  function showSlides(n) {
    if (n > slides.length) {
      slideIndex = 1;
    }
    if (n < 1) {
      slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }

    for (let i = 0; i < dot.length; i++) {
      dot[i].classList.remove('dot-active');
    }

    slides[slideIndex - 1].style.display = 'flex';
    dot[slideIndex - 1].classList.add('dot-active');

  };

  function plusSlides(n) {
    showSlides(slideIndex += n);
  };

  leftArrow.addEventListener('click', function () {
    plusSlides(-1);
  });

  rightArrow.addEventListener('click', function () {
    plusSlides(1);
  });

  function currentSlide(n) {
    showSlides(slideIndex = n);
  };

  dots.addEventListener('click', function (event) {
    for (let i = 0; i < dot.length + 1; i++) {
      if (event.target.classList.contains('control__item') && event.target == dot[i - 1]) {
        currentSlide(i);
      }
    };
  });
  
});

//Наверх
/*window.top = {};*/
document.addEventListener("DOMContentLoaded", function (event) {
  var sc = window.top;
  sc.time = 12; // врем¤ прокручивани¤
  sc.goTop = function (time, acceleration) {
    acceleration = acceleration || 0.1;
    time = time || sc.time;
    var dx = 0;
    var dy = 0;
    var bx = 0;
    var by = 0;
    var wx = 0;
    var wy = 0;
    if (document.documentElement) {
      dx = document.documentElement.scrollLeft || 0;
      dy = document.documentElement.scrollTop || 0;
    }
    if (document.body) {
      bx = document.body.scrollLeft || 0;
      by = document.body.scrollTop || 0;
    }
    var wx = window.scrollX || 0;
    var wy = window.scrollY || 0;
    var x = Math.max(wx, Math.max(bx, dx));
    var y = Math.max(wy, Math.max(by, dy));
    var speed = 1 + acceleration;
    window.scrollTo(Math.floor(x / speed), Math.floor(y / speed));
    if (x > 0 || y > 0) {
      var invokeFunction = "window.top.goTop(" + time + ")"
      window.setTimeout(invokeFunction, time);
    }
    return false;
  }
  sc.showHide = function () {
    var a = document.getElementById('gotop');
    if (!a) {
      // если нет элемента добавл¤ем его
      var a = document.createElement('a');
      a.id = "gotop";
      a.className = "scrollTop";
      a.href = "#";
      a.style.display = "none";
      a.style.position = "fixed";
      a.style.zIndex = "9999";
      a.onclick = function (e) {
        e.preventDefault();
        window.top.goTop();
      }
      document.body.appendChild(a);
    }
    var stop = (document.body.scrollTop || document.documentElement.scrollTop);
    if (stop > 300) {
      a.style.display = 'block';
      sc.smoothopaque(a, 'show', 30, false);
    } else {
      sc.smoothopaque(a, 'hide', 30, function () {
        a.style.display = 'none';
      });
    }
    return false;
  }
  // ѕлавна¤ смена прозрачности
  sc.smoothopaque = function (el, todo, speed, endFunc) {
    var
      startop = Math.round(el.style.opacity * 100),
      op = startop,
      endop = (todo == 'show') ? 100 : 0;
    clearTimeout(window['top'].timeout);
    window['top'].timeout = setTimeout(slowopacity, 30);

    function slowopacity() {
      if (startop < endop) {
        op += 5;
        if (op < endop)
          window['top'].timeout = setTimeout(slowopacity, speed);
        else
          (endFunc) && endFunc();
      } else {
        op -= 5;
        if (op > endop) {
          window['top'].timeout = setTimeout(slowopacity, speed);
        } else
          (endFunc) && endFunc();
      }
      // установка opacity
      el.style.opacity = (op / 100);
      el.style.filter = 'alpha(opacity=' + op + ')';
    }
  }
  if (window.addEventListener) {
    window.addEventListener("scroll", sc.showHide, false);
    window.addEventListener("load", sc.showHide, false);
  } else if (window.attachEvent) {
    window.attachEvent("onscroll", sc.showHide);
    window.attachEvent("onload", sc.showHide);
  }
});
