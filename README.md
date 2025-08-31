# Resume

In this repository I maintain and host my resume.

The source code consists of:
- `data.json` contains the data to render in the resume
- `resume.html.jinja2` is the template of the HTML file of the resume

## Rendering


### HTML

To render a new resume HTML file, run:

```bash
$ jinja -d data.json -o index.html resume.html.jinja2
```

### PDF

From the HTML file, a PDF file can be rendered:

```bash
$ weasyprint index.html resume.pdf
```

> [!tip]
> It is also possible to _Print to PDF_ in the browser, but so far the results have been less impressive than those from using `weasyprint`.

## Serving

GitHub Pages will pick up on the `index.html` file and serve its contents.
