<%@ page import="org.labkey.api.settings.AppProps" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<style>
    #necropsyRequestNotice {
        padding: 10px;
    }

    #necropsyRequestNotice > ul {
        list-style: none;
    }

    #necropsyRequestNotice > ul > li {
        position: relative;
        margin-bottom: 20px;
        font-weight: bold;
    }

    #necropsyRequestNotice > ul > li:before {
        /*
        The desired width gets defined in two places: The element width, and background size.
        The height only gets defined once, in background size.
        */
        position: absolute;
        display: block;
        content: '\2022'; /* bullet point, for screen readers */
        text-indent: -999999px; /* move the bullet point out of sight */
        left: -3em;
        width: 2em; /* desired width of the image */
        height: 2em; /* unrelated to image height; this is so it gets snipped */
        background-repeat: no-repeat;
        background-image: url('<%=AppProps.getInstance().getContextPath()%>/webutils/icons/warning_yellow.svg');
        background-size: 2em 1.5em;
        background-position: 0 .3em;
    }

</style>

<div id="necropsyRequestNotice">
    <ul>
        <li>
            Please request Clinpath Services directly, rather than requesting blood draws that animal care staff would
            perform.
        </li>
        <li>
            Investigators are responsible for providing all solutions for tissue preservation other than 10% neutral
            buffered formalin the day before or morning of necropsy. <span style="font-weight: normal">If a member of
            the investigating lab cannot order or does not provide the solutions needed for a specific necropsy, prior
            arrangements with SPI to prepare PFA, PBS and other solutions on a fee-for-service basis need to be made.
            Please indicate in the notes section of the necropsy request form that arrangements have been made for SPI
            to provide solutions.</span>
            <ul>
                <li>
                    Please indicate in the notes section of the necropsy request form if your laboratory will be
                    providing pre-labeled containers for samples or if the Pathology Services Unit should plan to
                    provide containers for samples.
                </li>
            </ul>
        </li>
        <li style="margin-bottom: 0px">
            Cultures of microorganisms may be carried out to accurately diagnose the cause of any
            pathological changes observed in necropsy that may impact or confound experimental results.  Please
            be advised that you will be contacted if diagnostic tests are necessary.  Charges will be applied to
            the grant listed below.
        </li>
    </ul>
</div>