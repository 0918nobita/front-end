/** @jsx Snabbdom.createElement */

import Snabbdom from 'snabbdom-pragma';
import { run, Sources } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import xs, { Stream } from 'xstream';

const drivers = {
    DOM: makeDOMDriver('#app')
};

const main = (sources: Sources<typeof drivers>) => {
    const action$: Stream<number> = xs.merge(
        sources.DOM.select('.decrement').events('click').map(() => -1),
        sources.DOM.select('.increment').events('click').map(() => 1)
    );

    const count$ = action$.fold((acc, x) => acc + x, 0);

    const vdom$ =
        count$.map(count =>
            <div>
                <button className="decrement">Decrement</button>
                <button className="increment">Increment</button>
                <p>Counter: {count}</p>
            </div>
        );

    return { DOM: vdom$ };
}

run(main, drivers);
