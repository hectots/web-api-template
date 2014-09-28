(function() {
	// Utility functions
	function flash(message, options) {
		var alertClass = "alert-";
		var shownFor = 1000;
		
		if (options && options.type) {
			alertClass += options.type;
		} else {
			alertClass += "success";
		}
		
		if (options && options.shownFor) {
			shownFor = options.shownFor;
		}
		
		$('.messages').html('<div class="alert ' + alertClass + '">' + message + '</div>');
		$('.alert').delay(shownFor).fadeOut(600);
		
		if (options.clear) {
			$('.page form').find('input[type="text"], textarea').val("");
		}
	}
	
	function capitalize(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}
	// --
	
	// Backbone.js stuff	
	var CRUD = {
		generate : function(modelName, params) {
			params = params || {};
			
			var Model = null;
			if (params.model) {
				Model = params.model;
			} else {
				Model = Backbone.Model.extend({
					urlRoot: '/' + modelName + 's'
				});
			}
			
			var Collection = null;
			if (params.collection) {
				Collection = params.collection;
			} else {
				var Collection = Backbone.Collection.extend({
					url: '/' + modelName + 's'
				});
			}
			
			var ListView = Backbone.View.extend({
				el : '.page',
				
				render : function() {
					var that = this;
					var collection = new Collection();
					collection.fetch({
						success :  function(collection) {
							var data = {}
							data[modelName + 's'] = collection.toJSON();
							that.$el.html(Mustache.render($('#template-' + modelName + 's-list').html(), data));
						}
					});
				},
			});
			
			var formViewEvents = {};
			formViewEvents['submit #edit-' + modelName + '-form'] = 'saveModel';
			formViewEvents['click .delete']                       = 'deleteModel';
			
			var FormView = Backbone.View.extend({
				el : '.page',
			
				render : function(options) {
					var that = this;
					var renderForm = function(vars) {
						that.$el.html(Mustache.render($('#template-form-' + modelName).html(), vars));
					};
										
					if (options.id) {
						that.model = new Model({id : options.id});
						that.model.fetch({
							success : function(model) {
								if (params.beforeRender) {
									params.beforeRender(renderForm, model.toJSON()[0]);
								} else {
									renderForm(model.toJSON()[0]);
								}
							},
							error : function(model) {
								flash('Could not retrieve ' + modelName + '!', _.extend({type : 'danger'}, vars));
							}
						});
					} else {
						if (params.beforeRender) {
							params.beforeRender(renderForm, {});
						} else {
							renderForm({});
						}
					}
				},
			
				events : formViewEvents,
			
				saveModel : function(e) {
					var modelFormData = $(e.currentTarget).serializeObject();
					
					if (params.beforeSave) {
						modelFormData = params.beforeSave(modelFormData);
					}
					
					var model = new Model();
					model.save(modelFormData, {
						success : function(model, response, options) {
							if (response.success) {
								flash(capitalize(modelName) + " created/updated", {clear : true});
							}
						},
						error : function(model, xhr, options) {
							flash("An error occured creating/updating the " + modelName, {type : 'danger'});
						}
					});
					
					return false;
				},
				
				deleteModel : function(e) {
					if (params.beforeDelete) {
						params.beforeDelete();
					}
					
					this.model.destroy({
						success : function() {
							router.navigate(modelName + 's', {trigger : true});
							flash(capitalize(modelName) + " deleted");
						},
						error : function() {
							flash(capitalize(modelName) + " could not be deleted", {type : 'danger'});
						}
					});
					
					return false;
				},
			});
			
			var routerRoutes = {};
			routerRoutes[modelName + 's']            = modelName + 'List';
			routerRoutes[modelName + 's/new']        = modelName + 'sForm';
			routerRoutes[modelName + 's/edit/:id']   = modelName + 'sForm';
			routerRoutes[modelName + 's/delete/:id'] = 'delete' + capitalize(modelName);
			
			var Router = Backbone.Router.extend({
				routes: routerRoutes,
			});
			
			var CollectionList =  new ListView();
			var modelForm = new FormView();
			
			var router = new Router();
			
			router.on('route:' + modelName + 'List', function() {
				CollectionList.render();
			});
			
			router.on('route:' + modelName + 'sForm', function(id) {
				modelForm.render({id : id});
			});
			
			router.on('route:delete' + capitalize(modelName), function(id) {
				var model = new Model({id : id});
				model.destroy();
				
				router.navigate(modelName + 's', {trigger : true});
				flash(capitalize(modelName) + ' deleted');
			});
			
			return {model: Model, collection: Collection, router: router};
		}
	}
		
	CRUD.generate("<model_name>");
	
	Backbone.history.start();
	// --
}());