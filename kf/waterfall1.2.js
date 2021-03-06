﻿kf['waterfall'] = function(obj, config){
	if (typeof(obj) == 'object') {
		this.obj = obj;
	} else {
		this.obj = $('#' + obj);
	}
	this.config = {
		action: '',
		actionType: 'json',
		actionPage: 1,
		moreBtn: true,
		autoShow: true,
		effect: 'fade',
		buffer: ''
	};
	if (config) {
		$.extend(this.config, config);
	}
	this.actpage = this.config['actionPage'];
	this.data = {};
	this.ready();
};
kf.augment(kf['waterfall'], {
	// 初始化
	ready: function(){
		var _this = this;
		this.modelObj = this.obj.find('.kf-waterfall-model');
		this.model = this.modelObj.val();
		//this.modelObj.remove();
		this.column = this.obj.find('.kf-waterfall-column');
		if (this.config['moreBtn']) {
			this.more = this.obj.find('.kf-waterfall-more');
			if (this.more.length == 0) {
				this.more = this.obj.find('.kf-waterfall-morebtn');
				this.morebtn = this.more;
			} else {
				this.morebtn = this.more.find('.kf-waterfall-morebtn');
			}
			this.morebtn.click(function(){
				_this.show();
				return false;
			});
		}
		this.action();
	},
	// 请求数据
	action: function(){
		var _this = this;
		if (this.config['moreBtn']) {
			this.more.addClass('fn-hide');
		}
		var currentPage = this.actpage;
		var url = this.config['action'].replace(/{\$page}/g, currentPage);
		if (url.indexOf('?') > -1) {
			url += '&r=' + Math.random();
		} else {
			url += '?r=' + Math.random();
		}
		this.actpage ++;
		$.ajax({
			dataType: this.config['actionType'],
			url: url,
			success: function(response){
				_this.data = response.data;
				if (_this.config['buffer'] != '') {
					$.each(_this.data, function() {
						var newImg = new Image();
						newImg.src = this[_this.config['buffer']];
					});
				}
				if (_this.data.length > 0) {
					if (currentPage == _this.config['actionPage'] && _this.config['autoShow']) {
						_this.show();
					} else {
						if (_this.config['moreBtn']) {
							_this.more.removeClass('fn-hide');
						}
					}
				}
			}
		});
	},
	// 展示数据
	show: function(){
		var _this = this;
		if (this.config['moreBtn']) {
			this.more.addClass('fn-hide');
		}
		this.dataLen = this.data.length;
		this.rankShow(0);
	},
	// 排队显示
	rankShow: function(index){
		var _this = this;
		if (index < this.dataLen) {
			var data = this.data[index];
			if (this.config['buffer'] != '') {
				var bufferVal = data[this.config['buffer']];
				var newImg = new Image();
				newImg.src = bufferVal;
				if (newImg.complete) {
					this.rankShowApp(index);
				} else {
					newImg.onload = function(){
						_this.rankShowApp(index);
					};
					newImg.onerror = function(){
						_this.rankShow(index + 1);
					};
				}
			} else {
				this.rankShowApp(index);
			}
		} else {
			if (this.config['moreBtn']) {
				this.action();
			}
		}
	},
	// 排队显示操作
	rankShowApp: function(index){
		var _this = this;
		var data = this.data[index];
		var content = this.model;
		$.each(data, function(key, val){
			var newReg = new RegExp('{\\$' + key + '}', 'g');
			content = content.replace(newReg, val);
		});
		var newObj = $(content);
		newObj.css('display', 'none');
		this.minCol().append(newObj);
		if (this.config['effect'] == 'fade') {
			newObj.fadeIn('fast', function(){
				_this.rankShow(index + 1);
			});
		} else if (this.config['effect'] == 'slide') {
			newObj.slideDown('fast', function(){
				_this.rankShow(index + 1);
			});
		} else {
			newObj.show('fast', function(){
				_this.rankShow(index + 1);
			});
		}
	},
	// 获取最短的列
	minCol: function(){
		var minObj = this.column.eq(0);
		var minHeight = minObj.height();
		$.each(this.column, function(index){
			if (index > 0) {
				if ($(this).height() < minHeight) {
					minHeight = $(this).height();
					minObj = $(this);
				}
			}
		});
		return minObj;
	}
});