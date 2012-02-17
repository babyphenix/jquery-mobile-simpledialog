 /*
 * jQuery Mobile Framework : plugin to provide a simple popup (modal) or jQMdialog (page) dialogs. ver2
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-simpledialog
 */
 
(function($, undefined ) {
  $.widget( "mobile.simpledialog2", $.mobile.widget, {
	options: {
		version: '1.0.1-2012021300', // jQueryMobile-YrMoDaySerial
		mode: 'blank', // or 'button'
		themeDialog: 'b',
		themeInput: 'e',
		themeButtonDefault: 'a',
		themeHeader: 'a',
		
		fullScreen: false,
		fullScreenForce: false,
		fullScreenLock: false,
		dialogAllow: false,
		dialogForce: false,
		
		headerText: false,
		headerClose: false,
		buttonPrompt: false,
		buttonInput: false,
		buttonPassword: false,
		blankContent: false,
		
		resizeListener: true,
		forceInput: true,
		showModal: true,
		animate: true,
		transition: 'pop',
		clickEvent: 'click',
		zindex: '500',
		width: '280px',
		left: false,
		top: false,
		
		callbackOpen: false,
		callbackClose: false,
	},
	_eventHandler: function(e,p) {
		// Handle the triggers
		var self = e.data.widget,
			o = e.data.widget.options;
		
		console.log('yo');
		if ( ! e.isPropagationStopped() ) {
			switch (p.method) {
				case 'close':
					self.close();
					break;
				case 'html':
					self.updateBlank(p.source);
					break;
			}
		}
	},
	_create: function () {
		var self = this,
			o = $.extend(this.options, this.element.data('options')),
			initDate = new Date(),
			content = $("<div class='ui-simpledialog-container ui-overlay-shadow ui-corner-all ui-simpledialog-hidden " + 
					((o.animate === true) ? o.transition : '') + " ui-body-" + o.themeDialog + "'></div>");
			
		$.mobile.activePage.jqmData('simpledialogActive', self.element);
		self.internalID = initDate.getTime();
		self.displayAnchor = $.mobile.activePage.children('.ui-content').first();
		
		self.dialogPage = $("<div data-role='dialog' class='ui-simpledialog-dialog' data-theme='" + o.themeDialog + "'><div data-role='content'></div></div>");
		self.sdAllContent = self.dialogPage.find('[data-role=content]');
		
		content.appendTo(self.sdAllContent);
		
		self.sdIntContent = self.sdAllContent.find('.ui-simpledialog-container');
		self.sdIntContent.css('width', o.width);
		
		if ( o.headerText !== false || o.headerClose !== false ) {
			self.sdHeader = $('<div class="ui-header ui-bar-'+o.themeHeader+'"></div>');
			if ( o.headerClose === true ) {
				$("<a class='ui-btn-left' rel='close' href='#'>Close</a>").appendTo(self.sdHeader).buttonMarkup({ theme  : o.themeHeader, icon   : 'delete', iconpos: 'notext', corners: true, shadow : true });
			}
			$('<h1 class="ui-title">'+((o.headerText !== false)?o.headerText:'')+'</h1>').appendTo(self.sdHeader);
			self.sdHeader.appendTo(self.sdIntContent);
		}
		
		if ( o.mode === 'blank' ) {
			$(o.blankContent).appendTo(self.sdIntContent);
		} else if ( o.mode === 'button' ) {
			self._makeButtons().appendTo(self.sdIntContent);
		}
		
		self.sdIntContent.appendTo(self.displayAnchor.parent());
		
		self.dialogPage.appendTo( $.mobile.pageContainer )
			.page().css('minHeight', '0px').css('zIndex', o.zindex);
			
		if ( o.animate === true ) { self.dialogPage.addClass(o.transition); }
		
		self.screen = $("<div>", {'class':'ui-simpledialog-screen ui-simpledialog-hidden'})
			.css('z-index', (o.zindex-1))
			.appendTo(self.displayAnchor.parent())
			.bind(o.clickEvent, function(event){
				if ( !o.forceInput ) {
					self.close();
				}
				event.preventDefault();
			});

		if ( o.showModal ) { self.screen.addClass('ui-simpledialog-screen-modal'); }
		
		$(document).bind('simpledialog.'+self.internalID, {widget:self}, function(e,p) { self._eventHandler(e,p); });
	},
	_makeButtons: function () {
		var self = this,
			o = self.options,
			buttonHTML = $('<div></div>'),
			pickerInput = $("<div class='ui-simpledialog-controls'><input class='ui-simpledialog-input ui-input-text ui-shadow-inset ui-corner-all ui-body-"+o.themeInput+"' type='"+((o.buttonPassword===true)?"password":"text")+"' name='pickin' /></div>"),
			pickerChoice = $("<div>", { "class":'ui-simpledialog-controls' });
			
		
		if ( o.buttonPrompt !== false ) {
			$("<p class='ui-simpledialog-subtitle'>"+o.buttonPrompt+"</p>").appendTo(buttonHTML);
		}
		
		if ( o.buttonInput !== false ) {
			pickerInput.appendTo(buttonHTML);
			pickerInput.find('input').bind('change', function () {
				self.displayAnchor.parent().jqmData('simpledialogInput', pickerInput.find('input').first().val());
			});
		}
		
		pickerChoice.appendTo(buttonHTML);
		
		self.butObj = [];
		
		$.each(o.buttons, function(name, props) {
			props = $.isFunction( props ) ? { click: props } : props;
			props = $.extend({
				text   : name,
				id     : name + self.internalID,
				theme  : o.themeButtonDefault,
				icon   : 'check',
				iconpos: 'left',
				corners: 'true',
				shadow : 'true',
				close  : true
			}, props);
			
			self.butObj.push($("<a href='#'>"+name+"</a>")
				.appendTo(pickerChoice)
				.attr('id', props.id)
				.buttonMarkup({
					theme  : props.theme,
					icon   : props.icon,
					iconpos: props.iconpos,
					corners: props.corners,
					shadow : props.shadow
				}).unbind("vclick click")
				.bind(o.clickEvent, function() {
					if ( o.buttonInput ) { self.sdIntContent.find('input [name=pickin]').trigger('change'); }
					var returnValue = props.click.apply(self.element[0], arguments);
					if ( returnValue !== false && props.close === true ) {
						self.close();
					}
				})
			);
		});
		
		return buttonHTML;
	},
	_getCoords: function(widget) {
		var self = widget,
			docWinWidth   = $.mobile.activePage.width(),
			docWinHighOff = $(window).scrollTop(),
			docWinHigh    = $(window).height(),
			diaWinWidth   = widget.sdIntContent.innerWidth(),
			diaWinHigh    = widget.sdIntContent.outerHeight(),
			
			coords        = {
				'high'    : $(window).height(),
				'width'   : $.mobile.activePage.width(),
				'fullTop' : $(window).scrollTop(),
				'fullLeft': $(window).scrollLeft(),
				'winTop'  : docWinHighOff + ((widget.options.top !== false) ? widget.options.top : (( docWinHigh / 2 ) - ( diaWinHigh / 2 ) )),
				'winLeft' : ((widget.options.left !== false) ? widget.options.left : (( docWinWidth / 2 ) - ( diaWinWidth / 2 ) ))
			};
			
		if ( coords.winTop < 45 ) { coords.winTop = 45; }
			
		return coords;
	},
	_orientChange: function(e) {
		var self = e.data.widget,
			o = e.data.widget.options,
			coords = e.data.widget._getCoords(e.data.widget);
		
		e.stopPropagation();
		
		if ( self.isDialog === true ) {
			return true;
		} else {
			if ( o.fullScreen == true && ( coords.width < 400 || o.fullScreenForce === true ) ) {
				self.sdIntContent.css({'border': '0px !important', 'position': 'absolute', 'top': coords.fullTop, 'left': coords.fullLeft, 'height': coords.high, 'width': coords.width, 'maxWidth': coords.width }).removeClass('ui-simpledialog-hidden');
			} else {
				self.sdIntContent.css({'position': 'absolute', 'top': coords.winTop, 'left': coords.winLeft}).removeClass('ui-simpledialog-hidden');
			}
		}
	},
	open: function() {
		var self = this,
			o = this.options,
			coords = this._getCoords(this);
		
		self.sdAllContent.find('.ui-btn-active').removeClass('ui-btn-active');
		self.sdIntContent.delegate('[rel=close]', o.clickEvent, function () { self.close(); });
		
		$(document).bind('orientationchange.simpledialog', {widget:self}, function(e) { self._orientChange(e); });
		
		if ( o.resizeListener === true ) {
			$(window).bind('resize.simpledialog', {widget:self}, function (e) { self._orientChange(e); });
		}
		
		/*if ( o.mode === 'blank' ) {
				o.selects = self.pickPage.find('.ui-selectmenu');

				o.selects.each(function () {
					o.selectparent.push($(this).closest('.ui-dialog'));
					$(this).appendTo(self.thisPage);
				});
		}*/
		
		if ( ( o.dialogAllow === true && coords.width < 400 ) || o.dialogForce ) {
			self.isDialog = true;
			self.displayAnchor.parent().unbind("pagehide.remove");
			self.sdAllContent.append(self.sdIntContent);
			self.sdIntContent.removeClass('ui-simpledialog-hidden ui-overlay-shadow').css({'top': 'auto', 'left': 'auto', 'marginLeft': 'auto', 'marginRight': 'auto', 'zIndex': o.zindex});
			$.mobile.changePage(self.dialogPage, {'transition': (o.animate === true) ? o.transition : 'none'});
		} else {
			self.isDialog = false;
			
			if ( o.fullScreen === false ) {
				if ( o.showModal === true && o.animate === true ) { self.screen.fadeIn('slow'); }
				else { self.screen.removeClass('ui-simpledialog-hidden'); }
			}
			
			self.sdIntContent.addClass('ui-overlay-shadow in').css('zIndex', o.zindex).trigger('create');
			
			if ( o.fullScreen == true && ( coords.width < 400 || o.fullScreenForce === true ) ) {
				self.sdIntContent.css({'border': '0px !important', 'position': 'absolute', 'top': coords.fullTop, 'left': coords.fullLeft, 'height': coords.high, 'width': coords.width, 'maxWidth': coords.width }).removeClass('ui-simpledialog-hidden');
			} else {
				self.sdIntContent.css({'position': 'absolute', 'top': coords.winTop, 'left': coords.winLeft}).removeClass('ui-simpledialog-hidden');
			}
		}
		if ( $.isFunction(o.callbackOpen) ) {
			o.callbackOpen(self);
		}
	},
	close: function() {
		var self = this;

		if ( self.isDialog ) {
			$(self.dialogPage).dialog('close');
			self.sdIntContent.addClass('ui-simpledialog-hidden');
			self.sdIntContent.appendTo(self.displayAnchor.parent());
			if ( $.mobile.activePage.jqmData("page").options.domCache != true ) {
				$.mobile.activePage.bind("pagehide.remove", function () {
					$(this).remove();
				});
			}
		} else {
			if ( self.options.showModal === true && self.options.animate === true ) {
				self.screen.fadeOut('slow');
			} else {
				self.screen.addClass('ui-simpledialog-hidden');
			}
			self.sdIntContent.addClass('ui-simpledialog-hidden').removeClass('in');
		}
		
		$.mobile.activePage.find('.ui-btn-active').removeClass('ui-btn-active');
		
		if ( $.isFunction(self.options.callbackOpen) ) {
			self.options.callbackClose(self);
		}
		
		if ( self.isDialog ) {
			setTimeout("$.mobile.activePage.jqmData('simpledialogActive').data('simpledialog2').destroy();", 1000);
		} else {
			self.destroy();
		}
	},
	destroy: function() {
		$(this.sdIntContent).remove();
		$(this.dialogPage).remove();
		$(this.screen).remove();
		$(document).unbind('simpledialog.'+this.internalID);
		$.mobile.activePage.jqmRemoveData('simpledialogActive');
		$.Widget.prototype.destroy.call(this);
	},
	updateBlank: function (newHTML) {
		var self = this,
			o = this.options;
			
		self.sdIntContent.empty();
			
		if ( o.headerText !== false || o.headerClose !== false ) {
			self.sdHeader = $('<div class="ui-header ui-bar-'+o.themeHeader+'"></div>');
			if ( o.headerClose === true ) {
				$("<a class='ui-btn-left' rel='close' href='#'>Close</a>").appendTo(self.sdHeader).buttonMarkup({ theme  : o.themeHeader, icon   : 'delete', iconpos: 'notext', corners: true, shadow : true });
			}
			$('<h1 class="ui-title">'+((o.headerText !== false)?o.headerText:'')+'</h1>').appendTo(self.sdHeader);
			self.sdHeader.appendTo(self.sdIntContent);
		}
		
		$(newHTML).appendTo(self.sdIntContent);
		self.sdIntContent.trigger('create');
		$(document).trigger('orientationchange.simpledialog');
	},
	_init: function() {
		this.open();
	},
  });
})( jQuery );
