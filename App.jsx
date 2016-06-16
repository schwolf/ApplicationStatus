// note that propvalidation - see http://facebook.github.io/react/docs/reusable-components.html#prop-validation - is not available using react.min.js (which is "production mode") due to performance optimizations.

class App extends React.Component {
	render() {
		return (
			<div className='starter-template'>
				{/*servers, monitoringSteps and soundUrl are base data from the server and no state, thus they are passed directly*/}
				<RowsContainer
					servers={this.props.servers}
					monitoringSteps={this.props.monitoringSteps}
					soundUrl={this.props.soundUrl}
				/>
				<ModalDialogContainer />
			</div>
		)
	}
}

// Container component, aware of Redux
class RowsContainer extends React.Component {
	componentDidMount() {
		$.ajaxSetup({ cache: false }); // avoid ie's aggressive ajax caching
		
		// Fetch data in componentDidMount, see https://facebook.github.io/react/tips/initial-ajax.html
		this.props.servers.forEach(server => {
			// let's make an initial call for this server...
			this.props.dispatch(requestStatusListActionCreator(server));
			
			// ... and set up the interval every 30 secs.
			// note that it might be better getting global object might be better regarding testability...
			window.setInterval(() => this.props.dispatch(requestStatusListActionCreator(server)), 30000, server);
		});
	}
	
	render() {
		// pass down all the props except dispatch, see https://facebook.github.io/react/docs/transferring-props.html
		const { dispatch, ...other } = this.props;
		return (
			<Rows
				{...other}
				onFlagSpanClick={ details => dispatch(showDialogActionCreator(details)) }
				onMaxRowsChange={ maxRows => dispatch(maxRowChangeActionCreator(maxRows)) }
			/>
		);
	}
}

// Presentational (dumb) component
class Rows extends React.Component {
	render() {
		const { servers, monitoringSteps, soundUrl, onFlagSpanClick, onMaxRowsChange, maxRows } = this.props;
		return (
			<div>
				{/* filter by 1st, 3rd etc server because we want to put 2 servers in one bootstrap row*/}
				{servers.filter((s, i) => { return i % 2 === 0}).map((s, i) => {
					return (
						<Row 
							server1 = {servers[i*2].name}
							server2 = {servers.length > i * 2 + 1 ? servers[i * 2 + 1].name : null}
							data1 = {this.props[servers[i * 2].name]}
							data2 = {servers.length > i * 2 + 1 ? this.props[servers[i * 2 + 1].name] : null}
							monitoringSteps = {monitoringSteps}
							key={i}
							onFlagSpanClick = { details => onFlagSpanClick(details) }
							soundUrl = {soundUrl}
						/>
					);
				})}
				<br/>
				<MaxRowSelector maxRows={maxRows} onMaxRowsChange={ maxRows => onMaxRowsChange(maxRows) } />
			</div>
		);
	}
}

function MaxRowSelector(props) {
	return (
		<div className='col-md-4 well well-sm'>
			<span>Show max. </span>
			<select value={props.maxRows} onChange={ev => { props.onMaxRowsChange(ev.target.value);}}>
				{[1, 2, 3, 4, 5].map(item => { return (
					<option value={item} key={item}>{item}</option>
				);})}
				<option value="0">all</option>
			</select>
			<span> row(s) per server</span>
		</div>
	);
}


// stateless function is enough for componentes which only need render()
function Row(props) {
	let statusList2;
	if (props.server2) {
		statusList2 = <StatusList 
						server = {props.server2}
						data = {props.data2}
						monitoringSteps = {props.monitoringSteps}
						onFlagSpanClick = { details => props.onFlagSpanClick(details) }
						soundUrl = {props.soundUrl}
					/>;
	}
	
	return (
		<div className='row'>
			<StatusList
				server={props.server1}
				data = {props.data1}
				monitoringSteps = {props.monitoringSteps}
				onFlagSpanClick = { details => props.onFlagSpanClick(details) }
				soundUrl = {props.soundUrl}
			/>
			{statusList2}
		</div>
	);
}

class StatusList extends React.Component {
	componentDidMount() {
		try {
			this.sound = new Audio(this.props.soundUrl);
		}
		catch(e) {
			// we love IE! no Audio on servers, see http://stackoverflow.com/questions/30061898/new-audio-not-implemented-in-internet-explorer
			this.sound = undefined;
		}
	}
	
	componentDidUpdate(prevProps) {
		if (this.sound !== undefined && this.props.data.isAlerting && this.props.data.rows[0] !== undefined && (prevProps.data.rows[0] === undefined || this.props.data.rows[0].end !== prevProps.data.rows[0].end)) {
			this.sound.play();
		}
	}
	
	render() {
		let panelClass = 'panel '; 
		if (this.props.data.isAlerting) {
			panelClass += 'panel-danger';
		}
		else {
			panelClass += 'panel-primary';
		}
		 
		return (
			<div className='col-md-6'>
				<div className={panelClass}>
					<div className="panel-heading">
						<h3 className='panel-title'>{this.props.server}</h3>
					</div>
					<table className='table table-condensed table-hover'>
						<thead>
							<tr>
								<th>Start</th>
								<th>End</th>
								{ this.props.monitoringSteps.map(step => { return (
								<th key={step.key}>{step.value}</th>
								);})}
							</tr>
						</thead>
						<tbody>
							{ this.props.data.rows.map((elem, index) => { return (
								<Tr 
									start={elem.start}
									end={elem.end}
									results={elem.results}
									monitoringSteps={this.props.monitoringSteps}
									key={index}
									onFlagSpanClick={ details => this.props.onFlagSpanClick(details) }
									/>
							);})}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

function Tr(props) {
	return (
		<tr>
									<td>
										{ moment(props.start).format("HH:mm") }
									</td>
									<td>
										{ moment(props.end).format("HH:mm") }
									</td>
									{ props.monitoringSteps.map(step => { return (
										<td key={step.key}>
											{(() => {
												const result = props.results[step.key];
												if (result.flag === true || result.flag === false) {
													return (
														<FlagSpan
															flag={result.flag}
															onClick={() => props.onFlagSpanClick(result.modalDialogContent)}
														/>
													);
												} else {
													return <span></span>;
												}
											})()}
										</td>
									);})}
								</tr>
	);
}

function FlagSpan(props) {
	// stateless function is enough for componentes which only need render()
	return (
			<span 
				className={ props.flag ? "ok" : "nok" }
				onClick={() => props.onClick()}
				dangerouslySetInnerHTML={ {__html: props.flag ? "&#10004;" : "&#10008;"} }></span>
	);
}

// Container component
class ModalDialogContainer extends React.Component {
	render() {
		// pass down all the props except dispatch, see https://facebook.github.io/react/docs/transferring-props.html
		const { dispatch, ...other } = this.props;
		return (
			<ModalDialog
				{...other}
				onClose={ () => dispatch(closeDialogActionCreator()) }
			/>
		);
	}
}

// Presentational component
class ModalDialog extends React.Component {
	render() {
		return (
			<div ref="myModal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal">&times;</button>
							<h4 claclassNamess="modal-title">Details</h4>
						</div>
						<div className="modal-body" ref="modalBody"></div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
	
	componentDidMount() {
		// no need to use $(ReactDOM.findDOMNode(this.refs.myModal)) because refs on dom components like <div /> give you the underlying DOM node. In contrast, composite components like <Foo /> would give the React class instance
		$(this.refs.myModal).on('hidden.bs.modal', () => { this.props.onClose();});
	}
	
	componentDidUpdate() {
		$(this.refs.modalBody).html(this.props.content);
		if (this.props.isVisible) {
			$(this.refs.myModal).modal("show");
		}
	}
}

var maxRows = 2;

// Wrap the component by calling connect() to inject dispatch and necessary parts of state into it
// It needs to be invoked two times. The first time with the selector and a second time with the component
// This augments the App with a dispatch function 
RowsContainer = ReactRedux.connect(function(state) {
	let dictionaryOfServerNameAndData = { maxRows: state.maxRows };
	initialState.servers.forEach(server => {
		dictionaryOfServerNameAndData[server.name] = limitToMaxRows(state[server.name]);
	});
		
	return dictionaryOfServerNameAndData;
	
	function limitToMaxRows(data) {
		let filteredData = $.extend({}, data, {
			rows: state.maxRows > 0 
				? data.rows.slice(0, state.maxRows)
				: data.rows
		});
	
		return filteredData;
	}
})(RowsContainer);

// It makes sense to have 2 connect()ed Container Components due to:
// 1. performance: Children of Container Components only get updates for relevant state changes
// 2. Isolation: We reduce calls of lifecycle methods and like this do not have to handle side effects within them, e.g. componentDidUpdate for StatusList does not additionally have to check if it has been triggered because of irrelevant components
ModalDialogContainer = ReactRedux.connect(function(state) {
	return {
		content: state.modalDialogContent,
		isVisible: state.isModalDialogVisible
	}
})(ModalDialogContainer);


const RECEIVE_STATUSLIST = "RECEIVE_STATUSLIST";
const SHOW_DIALOG = "SHOW_DIALOG";
const CLOSE_DIALOG = "CLOSE_DIALOG";
const CHANGE_MAXROWS = "CHANGE_MAXROWS";

function reducer(state, action) {
	switch(action.type) {
		case RECEIVE_STATUSLIST:
			// note that ES6 Object.assign({}, state, {[action.server.name]: action.data }) would be better but IE11 lacks Object.assign
			return $.extend({}, state, {
				[action.server.name]: action.data
			});
			break;
		case SHOW_DIALOG:
			return $.extend({}, state, {
				isModalDialogVisible: true, 
				modalDialogContent: action.modalDialogContent
			});
			break;
		case CLOSE_DIALOG:
			return $.extend({}, state, {
				isModalDialogVisible: false
			});
			break;
		case CHANGE_MAXROWS:
			return $.extend({}, state, {
				maxRows: action.value
			});
			break;
		default:
			return state;
	}
	return state;
}

const initialState = augmentInitialState(window.initialState)

const createStoreWithMiddleware = Redux.applyMiddleware(thunkMiddleware)(Redux.createStore)
const storeWithMiddleware = createStoreWithMiddleware(reducer, initialState);

const Provider = ReactRedux.Provider;
ReactDOM.render(
	<Provider store={storeWithMiddleware}>
		<App servers={initialState.servers}
		 	monitoringSteps={initialState.monitoringSteps}
			soundUrl={initialState.soundUrl}
		/>
	</Provider>,
    document.getElementById('app')
);

function requestStatusListActionCreator(server) { 
	return function(dispatch, getState) {
		$.get(server.apiUrl, data => {
			dispatch(receiveStatusListActionCreator(server, data));
		});
	}
}

function receiveStatusListActionCreator(server, data) {
	return {
		type: RECEIVE_STATUSLIST,
		server,
		data
	};
}

function showDialogActionCreator(content) { 
	return {
		type: SHOW_DIALOG,
		modalDialogContent: content
	};
}
function closeDialogActionCreator() { 
	return {
		type: CLOSE_DIALOG
	};
}
function maxRowChangeActionCreator(maxRows) {
	return {
		type: CHANGE_MAXROWS,
		value: maxRows	
	};
}


// see https://github.com/gaearon/redux-thunk
function thunkMiddleware({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}

function augmentInitialState(initialState) {
	// each server gets a property (name is server name) in the state containing the data for the StatusList
	initialState.servers.forEach(server => { initialState[server.name] =  { rows: [], isAlerting: false }});
	initialState.maxRows = 5;
	return initialState;
}
