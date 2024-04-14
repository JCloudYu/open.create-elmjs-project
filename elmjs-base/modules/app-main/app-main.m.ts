import {ElmJS} from "/lib/elmjs.js";
import {$EventBus, $Router, $Route} from "/runtime.js";

export class AppMain extends ElmJS.HTMLModule {
	#view_container:HTMLElement;
	constructor() {
		super();

		ElmJS.resolveExports(this);
		this.#view_container = this.getExportedElement<HTMLElement>('viewport')!;
	}

	init() {
		$EventBus.on('sys:init', ()=>this.sys_init());
		$Route.on('changed', (e)=>this.change_view(e));
	}

	sys_init() {
		this.#view_container.innerHTML = '';

		$Route.permData = {"beta-testing":''};
		$Route.replace(window.location.pathname);

		setInterval(()=>$EventBus.emit('tick:second'), 1_000);
	}

	change_view(e:Event&{op:string}) {
		const path = $Route.route.path;
		const result = $Router.locate<{view:HTMLElement}>(path);
		if ( !result ) {
			throw new Error(`No valid handler for route: ${path}!`);
		}

		
		const dest = result.meta.view;
		if ( !dest ) {
			throw new Error(`This route is not bound to a view: ${path}!`);
		}
		


		const curr_views = Array.from(this.#view_container.children);
		for(const view of curr_views) {
			if ( view === dest ) continue;
			
			view.remove();
			dest.emit('state:hide', false);
		}

		this.#view_container.append(dest);
		dest.emit('state:show', {params:result.params}, false);
	}
}

ElmJS.registerModule(AppMain, {tagName:'app-main', extends:'div'});