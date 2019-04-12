<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
 
<div id="processor-group-details" class="large-dialog">
    <div id="processor-group-id" style="display: none"></div>
    <div class="dialog-content">
        <div id='Grid'></div>
    </div>
</div>

<script type="text/template" id="colTip">
  {{:value }}
</script>
  
<script type="text/x-jsrender" id="caption">
    {{:key}} - <span class="time-details">{{:count}} {{if count == 1 }} item {{else}} items {{/if}} </span>
            Start Time: {{:~getStartTimeFunction(value)}}
            End Time: {{:~getEndTimeFunction(value)}}   
            Elapsed Time: {{:~getElapsedTimeFunction(value)}}
</script>

<script>
    var dataSource = [];
    $(function(){
        var startTimeSubstringValue = "";
        var endTimeSubstringValue = "";
        var startTimeStatus = {
            startTime: function (arg, index) {
                var startTimeValue = this.ctx.root.items[0].Start_time;
                if(startTimeSubstringValue === "")
                    startTimeSubstringValue = startTimeValue.substr(0, (startTimeValue.indexOf("GMT"))-1);
                return "<span class='time-details'>"+(startTimeSubstringValue===""?"-":startTimeSubstringValue)+"</span>"; 
            },
            
        };
        var endTimeStatus = {
            endTime: function (srg, index) {
                var endTimeValue = this.ctx.root.items[0].End_time;
                if(endTimeSubstringValue==="")
                    endTimeSubstringValue = endTimeValue.substr(0, (endTimeValue.indexOf("GMT"))-1);
                return "<span class='time-details'>"+ (endTimeSubstringValue===""?"-":endTimeSubstringValue)+ "</span>";
            }
        };
        
        var elapsedTimeStatus = {
            elapsedTime: function (srg, index){
                var elapsedTime = this.ctx.root.items[0].Elapsed_time;
                return "<span class='time-details'>"+(elapsedTime===""?"-":elapsedTime)+"</span>";
            }
        };
        
        $.views.helpers({ getStartTimeFunction: startTimeStatus.startTime });
        $.views.helpers({ getEndTimeFunction: endTimeStatus.endTime});
        $.views.helpers({ getElapsedTimeFunction: elapsedTimeStatus.elapsedTime});
        
        $("#Grid").ejGrid({
            dataSource: dataSource,
            allowGrouping: true,
            allowPaging: true,
            allowTextWrap: false,
            allowResizing:true,
            groupSettings: { showDropArea:false, showGroupedColumn:false, groupedColumns: ["WorkflowItem"], captionFormat: "#caption"},
            columns: [
                { field: "Name", headerText: "Name", isPrimaryKey: true, textAlign: ej.TextAlign.Left, width: 75, 
                    cssClass: "header-css", clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "Type", headerText: "Type", textAlign: ej.TextAlign.Left, width: 75, cssClass: "header-css", 
                    clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "Status", headerText: "Status", textAlign: ej.TextAlign.Left, width: 75, cssClass: "header-css", 
                    clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "In_size", headerText: "In/Size(5min)", textAlign: ej.TextAlign.Left, width: 75, cssClass: "header-css", 
                    clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "Read_write", headerText: "Read/Write(5min)", textAlign: ej.TextAlign.Left, width: 75, cssClass: "header-css", 
                    clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "Out_size", headerText: "Out/Size(5min)", textAlign: ej.TextAlign.Left, width: 75, cssClass: "header-css", 
                    clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "Scheduling_Period", headerText: "Scheduling Period", textAlign: ej.TextAlign.Left, cssClass: "header-css",
                    width: 75, clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "Validation_Message", headerText: "Error Message", textAlign: ej.TextAlign.Left,width: 75,
                    cssClass: "header-css", clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"},
                { field: "WorkflowItem", headerText: "WorkflowItem", textAlign: ej.TextAlign.Left, width: 75, 
                    cssClass: "header-css", clipMode: ej.Grid.ClipMode.EllipsisWithTooltip, tooltip:"#colTip"}
            ]
        }); 
    });
    
</script>