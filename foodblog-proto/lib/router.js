// Routing with Iron Router

Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {
	this.route('home', {path: '/'});
})