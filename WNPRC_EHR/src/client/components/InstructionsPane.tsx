import * as React from 'react';
import { FC } from 'react';


interface instructionsPane {
    componentProps: { instructions: string };
}

/*
    Instructions Pane
    Takes a string that can be formatted with bold
    after each format insert the separator tag (\s)

    Ex. *Some*\s \n\s **word**\s
    produces: italicized "Some", new line, bold "word"

    @param props componentProps containing {instructions: string}
    @returns Styled pane of instructions
 */
export const InstructionsPane: FC<instructionsPane> = (props) => {

    const {componentProps} = props;

    const {instructions} = componentProps;

    return(
      <>
          <div className="panel-heading">
              <h3>Instructions for Form</h3>
          </div>
          <div className="panel-body" style={{ whiteSpace: 'pre-line' }}>
              {instructions.split('\s').map((line, index) => {
                  if (line.includes('**')) {
                      const boldText = line.split('**').map((text, i) =>
                          i % 2 === 0 ? text : <b key={i}>{text}</b>
                      );
                      return <span key={index}>{boldText}</span>;
                  } else if (line.includes('*')) {
                      const italicText = line.split('*').map((text, i) =>
                          i % 2 === 0 ? text : <i key={i}>{text}</i>
                      );
                      return <span key={index}>{italicText}</span>;
                  }
                  return <span key={index}>{line}</span>;
              })}
          </div>
      </>
    );
}