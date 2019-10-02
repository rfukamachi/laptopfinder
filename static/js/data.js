

function init() {

    d3.json("/api/data").then(function(response) {
        $('#laptop-table').DataTable({
            data: response,
            // scrollY: 500,
            columns: [
                {data: 'store'},
                {data: 'price',
                  render: $.fn.DataTable.render.number(',', '.', 2, '$')
                },
                {data: 'brand'},
                {data: 'model'},
                {data: 'cpu'},
                {data: 'hd'},
                {data: 'ram'},
                {data: 'screensize'},
            //     // {data: 'title'},
                {data: 'upc'},
                {data: 'link',
                 searchable: false,
                 sortable: false,
                 render: function(link) {
                    console.log('Link', link);
                     if (!link) {
                         return 'NA';
                     }
                     else {
                        return '<a href=' + link + '>' + link.substr(0, 10) + '...' + '</a>';
                     }
                }}
            ]
        });
    });


    $(document).ready( function () {       
      });

}





/*****************************************************************/
// Call the initialization function to Initialize the dashboard
/*****************************************************************/
init();